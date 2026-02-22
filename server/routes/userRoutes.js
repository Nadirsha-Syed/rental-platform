const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { approveVendor } = require("../controllers/userController");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.put(
  "/approve/:id",
  protect,
  authorizeRoles("admin"),
  approveVendor
);
module.exports = router;