import RentalItem from "../models/RentalItem.js";

console.log("Rental Controller Loaded");

// ✅ 1. Named Export explicitly matching your routes mapping requirement
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
    });

    res.status(201).json(rental);
  } catch (error) {
    console.error("CREATE RENTAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2. Named Export for getRentalItems
export const getRentalItems = async (req, res) => {
  try {
    const { search, category, location } = req.query;
    let filter = {};

    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "All") {
      filter.category = { $regex: `^${category}`, $options: "i" };
    }

    if (location && location !== "All") {
      filter.location = { $regex: `^${location}$`, $options: "i" };
    }

    const rentals = await RentalItem.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (error) {
    console.error("GET RENTALS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. Named Export for getMyRentals
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

// ✅ 4. Named Export for getRentalById
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

// ✅ 5. Named Export for updateRentalItem
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

// ✅ 6. Named Export for deleteRentalItem
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