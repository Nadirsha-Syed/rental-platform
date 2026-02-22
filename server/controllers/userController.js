import User from "../models/User.js";

const approveVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "vendor") {
      return res.status(400).json({ message: "User is not a vendor" });
    }

    user.isApproved = true;
    await user.save();

    return res.json({ message: "Vendor approved successfully", user });

  } catch (error) {
    console.log("APPROVE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export { approveVendor };