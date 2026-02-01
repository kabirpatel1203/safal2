const express = require("express");
const router = express.Router();
const { createBuilder, getBuilder, updateBuilder, deleteBuilder, getAllBuilder, totalBuilder, changeBuilderSalesPerson } = require("../controllers/builderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/create").post(isAuthenticatedUser, createBuilder);
router.route("/getall").get(isAuthenticatedUser, getAllBuilder);
router.route("/get/:id").get(isAuthenticatedUser, getBuilder);
router.route("/update/:id").put(isAuthenticatedUser, updateBuilder);
router.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBuilder);
router.route("/change-salesperson").put(isAuthenticatedUser, authorizeRoles("admin"), changeBuilderSalesPerson);
router.route("/totalBuilder").get(isAuthenticatedUser, totalBuilder);

module.exports = router
