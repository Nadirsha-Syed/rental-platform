const RentalItem = require("../models/RentalItem");

// ✅ Create Rental Item (Protected)
const createRentalItem = async (req, res) => {
  try {
    const { title, category, description, pricePerHour, location } = req.body;

    const rental = await RentalItem.create({
      title,
      category,
      description,
      pricePerHour,
      location,
      owner: req.user._id, // 🔐 secure owner linking
    });

    res.status(201).json(rental);
  } catch (error) {
    console.log("CREATE RENTAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Rental Items (With Filters)
const getRentalItems = async (req, res) => {
  try {
    const { category, location } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    const rentals = await RentalItem.find(filter)
      .populate("owner", "name email");

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rentals" });
  }
};

// ✅ Get Single Rental Item
const getRentalById = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id)
      .populate("owner", "name email");

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rental" });
  }
};

// Update Rental Item (Owner Only)
const updateRentalItem = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    // 🔐 Authorization check
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this rental" });
    }

    const updatedRental = await RentalItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRental);
  } catch (error) {
    res.status(500).json({ message: "Error updating rental" });
  }
};

// Delete Rental Item (Owner Only)
const deleteRentalItem = async (req, res) => {
  try {
    const rental = await RentalItem.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    // 🔐 Authorization check
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this rental" });
    }

    await rental.deleteOne();

    res.json({ message: "Rental item removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rental" });
  }
};


module.exports = {
  createRentalItem,
  getRentalItems,
  getRentalById,
  updateRentalItem,
  deleteRentalItem,
};
