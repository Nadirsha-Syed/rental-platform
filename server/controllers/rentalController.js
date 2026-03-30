import RentalItem from "../models/RentalItem.js";

console.log("Rental Controller Loaded");

// ✅ Create Rental Item (Protected)
export const createRentalItem = async (req, res) => {
  try {
    const { title, category, description, pricePerHour, location, image } = req.body;

    // ✅ Basic validation
    if (!title || !category || !pricePerHour || !location || !image) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const rental = await RentalItem.create({
      title,
      category,
      description,
      pricePerHour: Number(pricePerHour),
      location,
      owner: req.user._id,
      image,
    });

    res.status(201).json(rental);
  } catch (error) {
    console.error("CREATE RENTAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Rental Items (With Filters)
export const getRentalItems = async (req, res) => {
  try {
    const { category, location } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (location) filter.location = location;

    const rentals = await RentalItem.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 }); // 🔥 latest first

    res.json(rentals);
  } catch (error) {
    console.error("GET RENTALS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ 🔥 Get My Rentals (NEW)
export const getMyRentals = async (req, res) => {
  try {
    const rentals = await RentalItem.find({ owner: req.user._id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (error) {
    console.error("MY RENTALS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Rental Item
export const getRentalById = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id)
      .populate("owner", "name email");

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    res.json(rental);
  } catch (error) {
    console.error("GET SINGLE RENTAL ERROR:", error);
    res.status(500).json({ message: "Error fetching rental" });
  }
};

// ✅ Update Rental Item (Owner Only)
export const updateRentalItem = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    // 🔐 Authorization check
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Allow only specific fields
    const allowedFields = ["title", "category", "description", "pricePerHour", "location", "image"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedRental = await RentalItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedRental);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Error updating rental" });
  }
};

// ✅ Delete Rental Item (Owner Only)
export const deleteRentalItem = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    // 🔐 Authorization check
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await rental.deleteOne();

    res.json({ message: "Rental item removed successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Error deleting rental" });
  }
};