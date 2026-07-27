import RentalItem from "../models/RentalItem.js";
import { sendMissedSearchAlertEmail } from "../utils/sendEmail.js";
import MissedSearch from "../models/MissedSearch.js";
import SearchNotification from "../models/SearchNotification.js";
import User from "../models/User.js";

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

console.log("Rental Controller Loaded");

export const createRentalItem = async (req, res) => {
  try {
    const { title, category, description, pricePerHour, location, image } = req.body;

    if (!title || !category || !pricePerHour || !location || !image) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const rental = await RentalItem.create({
      title,
      category,
      description,
      pricePerHour: Number(pricePerHour),
      location,
      owner: req.user._id || req.user.id,
      image,
    }
  );
  res.status(201).json(rental);
  (async () =>{
    try{
      const keywords=rental.title.toLowerCase().split(/\s+/).filter((word)=>word.length>2).map((word)=>escapeRegex(word));
      const categoryRegex=escapeRegex(rental.category.toLowerCase());

      const searchConditions=keywords.map((keyword)=>({
        searchQuery: { $regex: keyword, $options: "i" }
      }));

      searchConditions.push({ 
        searchQuery: { $regex: categoryRegex, $options: "i" }
      });

      const queryFilter = {
        $and: [
          { $or: searchConditions },
          { $or: [{ isFulfilled: false }, { isFulfilled: { $exists: false } }] }
        ]
      };

      if(rental.location && rental.location.trim() !== "All"){
        queryFilter.location = {
          $in : [new RegExp(`^${escapeRegex(rental.location)}$`, "i"),"All"],
        };
      }

      const matchedDemands=await MissedSearch.find(queryFilter);

      if(matchedDemands.length>0){
        const totalMissedCount=matchedDemands.reduce((acc,doc)=>acc+(doc.searchCount || 1),0);
        console.log(`New item ${rental.title} fullfills ${totalMissedCount} missed search demands`);

        const matchedIds=matchedDemands.map((doc)=>doc._id);
        await MissedSearch.updateMany(
          {_id:{$in:matchedIds}},
        {
          $set : {
            isFulfilled:true,
            fulfilledAt:new Date(),
            fulfilledBy:rental._id,
          }
        });
      }
      }catch(err){
        console.error("Demand match resolution error :",err.message);
  }})();
  } catch (error) {
    console.error("CREATE RENTAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



export const getRentalItems = async (req, res) => {
  try {
    const { search, category, location } = req.query;
    let filter = {};

    const cleanSearch = search ? search.trim() : "";
    const escapedSearch = escapeRegex(cleanSearch);

    if (cleanSearch !== "") {
      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = { $regex: `^${escapeRegex(category)}`, $options: "i" };
    }

    if (location && location !== "All") {
      filter.location = { $regex: `^${escapeRegex(location)}$`, $options: "i" };
    }

    const rentals = await RentalItem.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    if (rentals.length === 0 && cleanSearch !== "") {
      (async () => {
        try {
          const lowerQuery = cleanSearch.toLowerCase();
          const targetLocation = location || "All";

          // 1. Atomic Upsert: Prevents race conditions across concurrent searches
          await MissedSearch.findOneAndUpdate(
            { searchQuery: lowerQuery, location: targetLocation },
            { $inc: { searchCount: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          // 2. Tokenized Keyword Match (e.g. "Sony Alpha A7" -> ["sony", "alpha", "a7"])
          const keywords = cleanSearch
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 2)
            .map(escapeRegex);

          let relatedFilter = {};
          if (keywords.length > 0) {
            relatedFilter.$or = keywords.flatMap((kw) => [
              { title: { $regex: kw, $options: "i" } },
              { category: { $regex: kw, $options: "i" } },
            ]);
          }

          if (targetLocation !== "All") {
            relatedFilter.location = { $regex: `^${escapeRegex(targetLocation)}$`, $options: "i" };
          }

          let relevantItems = await RentalItem.find(relatedFilter).populate("owner", "name email");

          if (relevantItems.length === 0) {
            const fallbackFilter = {};
            if (category && category !== "All") {
              fallbackFilter.category = { $regex: `^${escapeRegex(category)}`, $options: "i" };
            }
            if (targetLocation !== "All") {
              fallbackFilter.location = { $regex: `^${escapeRegex(targetLocation)}$`, $options: "i" };
            }

            if (Object.keys(fallbackFilter).length > 0) {
              relevantItems = await RentalItem.find(fallbackFilter).populate("owner", "name email");
            }
          }

          const ownerMap = new Map();
          relevantItems.forEach((item) => {
            if (item.owner && item.owner.email) {
              ownerMap.set(item.owner._id.toString(), item.owner);
            }
          });

          let candidateOwners = Array.from(ownerMap.values());

          if(candidateOwners.length === 0) {
            const currentUserId = req.user?._id || req.user?.id;
            candidateOwners=await User.find({_id:{$ne:currentUserId}}).select("name email");
          }

          if (candidateOwners.length === 0) return;

          const TWENTY_FOUR_HOURS_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

          const recentNotifications = await SearchNotification.find({
            owner: { $in: candidateOwners.map((o) => o._id) },
            searchQuery: lowerQuery,
            location: targetLocation,
            notifiedAt: { $gte: TWENTY_FOUR_HOURS_AGO },
          });

          const recentlyNotifiedOwnerIds = new Set(
            recentNotifications.map((n) => n.owner.toString())
          );

          const ownersToAlert = candidateOwners
            .filter((owner) => !recentlyNotifiedOwnerIds.has(owner._id.toString()))
            .slice(0, 5);

          if (ownersToAlert.length > 0) {
            const emailPromises = ownersToAlert.map((owner) =>
              sendMissedSearchAlertEmail(
                owner.email,
                owner.name,
                cleanSearch,
                targetLocation !== "All" ? targetLocation : "your area"
              )
            );

            const results = await Promise.allSettled(emailPromises);

            const newNotificationLogs = [];
            ownersToAlert.forEach((owner, index) => {
              if (results[index].status === "fulfilled") {
                newNotificationLogs.push({
                  owner: owner._id,
                  searchQuery: lowerQuery,
                  location: targetLocation,
                  notifiedAt: new Date(),
                });
              }
            });

            if (newNotificationLogs.length > 0) {
              await SearchNotification.insertMany(newNotificationLogs);
            }
          }
        } catch (bgErr) {
          console.error("⚠️ Missed Search Background Engine Error:", bgErr.message);
        }
      })();
    }

    res.json(rentals);
  } catch (error) {
    console.error("GET RENTALS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyRentals = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const rentals = await RentalItem.find({ owner: currentUserId })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (error) {
    console.error("MY RENTALS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRentalById = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id).populate("owner", "name email");

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    res.json(rental);
  } catch (error) {
    console.error("GET SINGLE RENTAL ERROR:", error);
    res.status(500).json({ message: "Error fetching rental" });
  }
};

export const updateRentalItem = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id);
    const currentUserId = req.user?._id || req.user?.id;

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    if (rental.owner.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedFields = ["title", "category", "description", "pricePerHour", "location", "image"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedRental = await RentalItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedRental);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Error updating rental" });
  }
};

export const deleteRentalItem = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id);
    const currentUserId = req.user?._id || req.user?.id;

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    if (rental.owner.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await rental.deleteOne();
    res.json({ message: "Rental item removed successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Error deleting rental" });
  }
};