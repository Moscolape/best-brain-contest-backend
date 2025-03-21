const Beneficiary = require("../models/beneficiaries");
const UpdateHistory = require("../models/updateHistory");

const { validationResult } = require("express-validator");

// Register a new beneficiary
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

    // Generate unique Beneficiary Code
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

// Get all beneficiaries with filtering and sorting options
exports.getAllBeneficiaries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const { state, sortBy } = req.query; // Extract query parameters

  try {
    let filter = {}; // Default: Fetch all

    // Apply state filter if provided
    if (state) filter.state = state;

    // Determine sorting order
    let sortOptions = {}; // Default: No sorting
    if (sortBy) {
      if (sortBy === "beneficiaryName") sortOptions = { beneficiaryName: 1 }; // Sort by name (A-Z)
      if (sortBy === "codeNo") sortOptions = { codeNo: 1 }; // Sort by Code No (Ascending)
    }

    // **Fix: Count only filtered beneficiaries**
    const totalItems = await Beneficiary.countDocuments(filter);

    // Fetch paginated and sorted data
    const beneficiariesQuery = Beneficiary.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage);

    // Apply sorting only when sortBy is provided
    if (Object.keys(sortOptions).length > 0) {
      beneficiariesQuery.sort(sortOptions);
    }

    const beneficiaries = await beneficiariesQuery;

    res.status(200).json({
      message: "Beneficiaries fetched successfully!",
      beneficiaries,
      totalItems, // Now correctly reflects filtered items
      currentPage: page,
      totalPages: Math.ceil(totalItems / perPage),
      perPage,
    });
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a single beneficiary by beneficiaryCode
exports.getSingleBeneficiary = async (req, res) => {
  const { beneficiaryCode } = req.params;

  try {
    const decodedCode = decodeURIComponent(beneficiaryCode);

    const beneficiary = await Beneficiary.findOne({
      beneficiaryCode: decodedCode,
    });

    if (!beneficiary) {
      console.log("Beneficiary not found in database.");
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    res.status(200).json({ message: "Beneficiary found", beneficiary });
  } catch (error) {
    console.error("Error fetching beneficiary:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a beneficiary by beneficiaryCode
exports.updateBeneficiary = async (req, res) => {
  const { beneficiaryCode } = req.params;

  try {
    const decodedCode = decodeURIComponent(beneficiaryCode);

    // Find the existing beneficiary record
    let beneficiary = await Beneficiary.findOne({
      beneficiaryCode: decodedCode,
    });

    if (!beneficiary) {
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    // Store the previous data before updating
    const previousData = { ...beneficiary._doc };

    // Save previous data into UpdateHistory collection
    await UpdateHistory.create({
      beneficiaryCode: decodedCode,
      previousData,
      updatedBy: req.user?.email || "System", // Store user info if available
    });

    // Update only the provided fields
    Object.keys(req.body).forEach((key) => {
      beneficiary[key] = req.body[key];
    });

    // Save the updated beneficiary
    await beneficiary.save();

    res.status(200).json({
      message: "Beneficiary updated successfully",
      updatedData: beneficiary, // The new updated data
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
  
      const history = await UpdateHistory.find({ beneficiaryCode: decodedCode }).sort({ updatedAt: -1 });
  
      if (!history.length) {
        return res.status(404).json({ message: "No update history found for this beneficiary" });
      }
  
      res.status(200).json({ message: "Update history fetched successfully", history });
    } catch (error) {
      console.error("Error fetching update history:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  