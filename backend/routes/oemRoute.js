const express = require("express");
const router = express.Router();
const { createOEM, getOEM, updateOEM, deleteOEM, getAllOEM, totaloem, changeOemSalesPerson } = require("../controllers/oemController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/create").post(isAuthenticatedUser, createOEM);
router.route("/getall").get(isAuthenticatedUser, getAllOEM);
router.route("/get/:id").get(isAuthenticatedUser, getOEM);

router.route("/update/:id").put(isAuthenticatedUser, updateOEM);
router.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOEM);
router.route("/change-salesperson").put(isAuthenticatedUser, authorizeRoles("admin"), changeOemSalesPerson);
router.route("/totaloems").get(isAuthenticatedUser, totaloem);

module.exports = router
