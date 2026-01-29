const express = require("express");
const router = express.Router();
const { createArchitect, getArchitect, updateArchitect, deleteArchitect, getAllArchitect, totalarchitect } = require("../controllers/architectController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/create").post(isAuthenticatedUser, createArchitect);
router.route("/getall").get(isAuthenticatedUser, getAllArchitect);
router.route("/get/:id").get(isAuthenticatedUser, getArchitect);
router.route("/update/:id").put(isAuthenticatedUser, updateArchitect);
router.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteArchitect);

// Admin: Change sales person for an architect
router.route("/change-salesperson").put(isAuthenticatedUser, authorizeRoles("admin"), require("../controllers/architectController").changeArchitectSalesPerson);

router.route("/totalarchitects").get(isAuthenticatedUser, totalarchitect);

module.exports = router