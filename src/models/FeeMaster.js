const mongoose = require("mongoose");

const FeeMasterSchema = new mongoose.Schema(
  {
    // One blueprint per class name (e.g., "Six")
    applicableClass: { type: String, required: true, unique: true },
    fees: {
      sessionFee: { type: Number, default: 0 },
      itFee: { type: Number, default: 0 },
      examFees: {
        halfYearly: { type: Number, default: 0 },
        annual: { type: Number, default: 0 },
        preTest: { type: Number, default: 0 },
        test: { type: Number, default: 0 },
      },
      monthlyFees: {
        january: { type: Number, default: 0 },
        february: { type: Number, default: 0 },
        march: { type: Number, default: 0 },
        april: { type: Number, default: 0 },
        may: { type: Number, default: 0 },
        june: { type: Number, default: 0 },
        july: { type: Number, default: 0 },
        august: { type: Number, default: 0 },
        september: { type: Number, default: 0 },
        october: { type: Number, default: 0 },
        november: { type: Number, default: 0 },
        december: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeMaster", FeeMasterSchema);
