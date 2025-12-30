const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    classTeacherOf: {
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

/**
 * --- FIX: MODERN ASYNC PRE-SAVE HOOK ---
 * By using an async function without the 'next' parameter,
 * Mongoose will wait for the promise to resolve before saving.
 */
userSchema.pre("save", async function () {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) {
      return; // Simply return to proceed
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No need to call next() here in an async pre-save hook
  } catch (error) {
    throw error; // Rethrow to be caught by the controller's try-catch
  }
});

// --- PASSWORD COMPARISON METHOD ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("User", userSchema);
