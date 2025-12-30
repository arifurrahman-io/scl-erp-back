const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "TEACHER", "CLASS_TEACHER", "ACCOUNTANT"],
      required: true,
    },
    assignedCampuses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campus" }],

    // CRITICAL FIX: Define the nested structure here
    classTeacherOf: {
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // ref must match model name
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    },

    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
