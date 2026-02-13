const RentalItem = require("../models/RentalItem");

// Create Rental Item
const createRentalItem = async (req, res) => {
  try {
    const { title, category, description, pricePerHour, location } = req.body;

    const rental = await RentalItem.create({
      title,
      category,
      description,
      pricePerHour,
      location,
      owner: req.user._id,
    });

    res.status(201).json(rental);
  } catch (error) {
  console.log("CREATE RENTAL ERROR:", error);
  res.status(500).json({ message: error.message });
}

};

// Get All Rental Items
const getRentalItems = async (req, res) => {
  const rentals = await RentalItem.find().populate("owner", "name email");
  res.json(rentals);
};

// Get Single Rental Item
const getRentalById = async (req, res) => {
  const rental = await RentalItem.findById(req.params.id).populate(
    "owner",
    "name email"
  );

  if (rental) {
    res.json(rental);
  } else {
    res.status(404).json({ message: "Rental item not found" });
  }
};

module.exports = {
  createRentalItem,
  getRentalItems,
  getRentalById,
};
