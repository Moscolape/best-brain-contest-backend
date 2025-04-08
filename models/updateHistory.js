const mongoose = require("mongoose");

const updateHistorySchema = new mongoose.Schema({
  beneficiaryCode: { type: String, required: true },
  previousData: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const UpdateHistory = mongoose.model("UpdateHistory", updateHistorySchema);

module.exports = UpdateHistory;