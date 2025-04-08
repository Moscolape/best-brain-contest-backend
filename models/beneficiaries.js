const mongoose = require("mongoose");

const beneficiarySchema = new mongoose.Schema(
  {
    beneficiaryName: { type: String, required: true },
    codeNo: { type: String, required: true },
    school: { type: String, required: true },
    state: { type: String, required: true },
    year: { type: String, required: true },
    parentPhone: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNo: { type: String, required: true },
    bank: { type: String, required: true },
    js1: { type: String, enum: ["Paid", "Not Paid"], required: true },
    js2: { type: String, enum: ["Paid", "Not Paid"], required: true },
    js3: { type: String, enum: ["Paid", "Not Paid"], required: true },
    juniorWAEC: { type: String, enum: ["Paid", "Not Paid"], required: true },
    ss1: { type: String, enum: ["Paid", "Not Paid"], required: true },
    ss2: { type: String, enum: ["Paid", "Not Paid"], required: true },
    ss3: { type: String, enum: ["Paid", "Not Paid"], required: true },
    seniorWAEC: { type: String, enum: ["Paid", "Not Paid"], required: true },
    beneficiaryCode: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const Beneficiary = mongoose.model("Beneficiary", beneficiarySchema);
module.exports = Beneficiary;
