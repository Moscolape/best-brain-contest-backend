const Beneficiary = require("../models/beneficiaries");
const UpdateHistory = require("../models/updateHistory");

const { validationResult } = require("express-validator");

exports.registerBeneficiary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      beneficiaryName,
      codeNo,
      school,
      state,
      year,
      parentPhone,
      accountName,
      accountNo,
      bank,
      js1,
      js2,
      js3,
      juniorWAEC,
      ss1,
      ss2,
      ss3,
      seniorWAEC,
    } = req.body;

    const beneficiaryCode = `DIPF/${state}/${year}/${codeNo}`;

    const newBeneficiary = new Beneficiary({
      beneficiaryName,
      codeNo,
      school,
      state,
      year,
      parentPhone,
      accountName,
      accountNo,
      bank,
      js1,
      js2,
      js3,
      juniorWAEC,
      ss1,
      ss2,
      ss3,
      seniorWAEC,
      beneficiaryCode,
    });

    await newBeneficiary.save();
    res.status(201).json({
      message: "Beneficiary registered successfully",
      beneficiary: newBeneficiary,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllBeneficiaries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const { state, sortBy, year } = req.query;

  try {
    let filter = {};

    if (state) filter.state = state;

    if (year) filter.year = year;

    let sortOptions = {};
    if (sortBy) {
      if (sortBy === "beneficiaryName") sortOptions = { beneficiaryName: 1 };
      if (sortBy === "codeNo") sortOptions = { codeNo: 1 };
    }

    const totalItems = await Beneficiary.countDocuments(filter);

    const beneficiariesQuery = Beneficiary.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (Object.keys(sortOptions).length > 0) {
      beneficiariesQuery.sort(sortOptions);
    }

    const beneficiaries = await beneficiariesQuery;

    res.status(200).json({
      message: "Beneficiaries fetched successfully!",
      beneficiaries,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / perPage),
      perPage,
    });
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getSingleBeneficiary = async (req, res) => {
  const { beneficiaryCode } = req.params;

  try {
    const decodedCode = decodeURIComponent(beneficiaryCode);

    const beneficiary = await Beneficiary.findOne({
      beneficiaryCode: decodedCode,
    });

    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    res.status(200).json({ message: "Beneficiary found", beneficiary });
  } catch (error) {
    console.error("Error fetching beneficiary:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateBeneficiary = async (req, res) => {
  const { beneficiaryCode } = req.params;

  try {
    const decodedCode = decodeURIComponent(beneficiaryCode);

    let beneficiary = await Beneficiary.findOne({
      beneficiaryCode: decodedCode,
    });

    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    const previousData = { ...beneficiary._doc };

    await UpdateHistory.create({
      beneficiaryCode: decodedCode,
      previousData,
    });

    Object.keys(req.body).forEach((key) => {
      beneficiary[key] = req.body[key];
    });

    await beneficiary.save();

    res.status(200).json({
      message: "Beneficiary updated successfully",
      updatedData: beneficiary,
    });
  } catch (error) {
    console.error("Error updating beneficiary:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getBeneficiaryUpdateHistory = async (req, res) => {
  const { beneficiaryCode } = req.params;

  try {
    const decodedCode = decodeURIComponent(beneficiaryCode);

    const history = await UpdateHistory.find({
      beneficiaryCode: decodedCode,
    }).sort({ updatedAt: -1 });

    if (!history) {
      return res
        .status(404)
        .json({ message: "No update history found for this beneficiary" });
    }

    res
      .status(200)
      .json({ message: "Update history fetched successfully", history });
  } catch (error) {
    console.error("Error fetching update history:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
