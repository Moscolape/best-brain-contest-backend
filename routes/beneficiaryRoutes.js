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

router.post("/beneficiary/register", registerBeneficiary);

router.get("/beneficiary/getAll", getAllBeneficiaries);

router.get("/beneficiary/:beneficiaryCode", getSingleBeneficiary);

router.put("/beneficiary/:beneficiaryCode", isAuthenticated, updateBeneficiary);

router.get("/beneficiary/history/:beneficiaryCode", isAuthenticated, getBeneficiaryUpdateHistory);

module.exports = router;
