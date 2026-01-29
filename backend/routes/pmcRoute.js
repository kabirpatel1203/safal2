const express = require("express");
const router = express.Router();
const { createPMC, getPMC, updatePMC, deletePMC, getAllPMC, totalPMC, changePMCSalesPerson } = require("../controllers/pmcController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/create").post(isAuthenticatedUser, createPMC);
router.route("/getall").get(isAuthenticatedUser, getAllPMC);
router.route("/get/:id").get(isAuthenticatedUser, getPMC);
router.route("/update/:id").put(isAuthenticatedUser, updatePMC);
router.route("/delete/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deletePMC);
router.route("/change-salesperson").put(isAuthenticatedUser, authorizeRoles("admin"), changePMCSalesPerson);
router.route("/totalPMC").get(isAuthenticatedUser, totalPMC);

module.exports = router