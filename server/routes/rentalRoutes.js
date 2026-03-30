import express from "express";
const router = express.Router();

 import { authorizeRoles } from "../middleware/roleMiddleware.js";
 import { protect } from "../middleware/authMiddleware.js";
import {
  createRentalItem,
  getRentalItems,
  getRentalById,
  updateRentalItem,
  deleteRentalItem,
  getMyRentals,
} from "../controllers/rentalController.js";


console.log("rental routes loaded");
// router.post(
//   "/",
//   protect,
//   authorizeRoles("vendor", "admin"),
//   async (req, res, next) => {
//     if (req.user.role === "vendor" && !req.user.isApproved) {
//       return res.status(403).json({
//         message: "Vendor not approved by admin",
//       });
//     }
//     next();
//   },
//   createRentalItem
// );

router.post("/",protect, createRentalItem);
router.get("/my", protect, getMyRentals); // NEW ROUTE
router.get("/", getRentalItems);
router.get("/:id", getRentalById);
router.put("/:id", protect, updateRentalItem);
router.delete("/:id", protect, deleteRentalItem);

export default router;