import RentalItem from "../models/RentalItem.js";

console.log("Rental Controller Loaded"); // Debugging log

// ✅ Create Rental Item (Protected)
export const createRentalItem = async (req, res) => {
  console.log("Creating Rental Item with data:", req.body); // Debugging log
  try {
    const { title, category, description, pricePerHour, location, image } = req.body;

    const rental = await RentalItem.create({
      title,
      category,
      description,
      pricePerHour: Number(pricePerHour),
      location,
      owner: req.user._id, // 🔐 secure owner linking
      image,
    });

    res.status(201).json(rental);
  } catch (error) {
    console.log("CREATE RENTAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Rental Items (With Filters)
export const getRentalItems = async (req, res) => {
  console.log("real controller running");
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
    console.error("error:", error);
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
    res.status(500).json({ message: "Error fetching rental" });
  }
};

// Update Rental Item (Owner Only)
export const updateRentalItem = async (req, res) => {
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
export const deleteRentalItem = async (req, res) => {
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