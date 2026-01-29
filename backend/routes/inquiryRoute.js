const express = require("express");
const router = express.Router();
const { createInquiry, getInquiry, updateInquiry, deleteInquiry, getAllInquiry, totalInquiry ,getFilteredInquiry, migrateInquiries, changeInquirySalesPerson } = require("../controllers/inquiryController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/create").post(isAuthenticatedUser, createInquiry);
router.route("/getall").get(isAuthenticatedUser, getAllInquiry);
router.route("/get/:id").get(isAuthenticatedUser, getInquiry);
router.route("/update/:id").put(isAuthenticatedUser, updateInquiry);
router.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteInquiry);
router.route("/change-salesperson").put(isAuthenticatedUser, authorizeRoles("admin"), changeInquirySalesPerson);
router.route("/get/:salesman/:branch/:startdate/:enddate").get(isAuthenticatedUser,getFilteredInquiry);
router.route("/migrate/legacy").post(isAuthenticatedUser, migrateInquiries);
// router.route("/get").get(isAuthenticatedUser,getFilteredInquiry);
// router.route("/totalinquiry").get(isAuthenticatedUser, totalInquiry);

module.exports = router