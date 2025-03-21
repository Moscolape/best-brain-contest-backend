const express = require("express");
const {
  registerBeneficiary,
  getAllBeneficiaries,
  getSingleBeneficiary,
  updateBeneficiary,
  getBeneficiaryUpdateHistory
} = require("../controllers/beneficiaryController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// POST /beneficiary/register - Register a new beneficiary
router.post("/beneficiary/register", registerBeneficiary);

// GET /beneficiary - Retrieve all beneficiaries with pagination
router.get("/beneficiary/getAll", getAllBeneficiaries);

// Get a single beneficiary by beneficiaryCode
router.get("/beneficiary/:beneficiaryCode", getSingleBeneficiary);

router.put("/beneficiary/:beneficiaryCode", isAuthenticated, updateBeneficiary);

router.get("/beneficiary/history/:beneficiaryCode", isAuthenticated, getBeneficiaryUpdateHistory);

module.exports = router;
