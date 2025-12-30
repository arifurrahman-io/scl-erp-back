// Corrected path to reach models from src/controllers
const FeeMaster = require("../models/FeeMaster");
const FeeTransaction = require("../models/FeeTransaction");

// 1. Save or Update Bulk Fee Blueprint
exports.saveBulkFeeMaster = async (req, res) => {
  try {
    const { applicableClass, fees } = req.body;

    // Use findOneAndUpdate with upsert to either update existing class blueprint or create new
    const updatedBlueprint = await FeeMaster.findOneAndUpdate(
      { applicableClass },
      { fees },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Fee blueprint for Class ${applicableClass} updated successfully`,
      data: updatedBlueprint,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Process Multi-Item Payment
exports.collectFees = async (req, res) => {
  try {
    const {
      student,
      studentId,
      campus,
      academicYear,
      selectedItems,
      totalAmount,
      paymentMethod,
    } = req.body;

    const receiptNo = `RCP-${Date.now()}`;

    const transaction = await FeeTransaction.create({
      student,
      studentId,
      campus,
      academicYear,
      items: selectedItems, // Array of { feeName, amount, category }
      totalAmount,
      paymentMethod,
      receiptNo,
      receivedBy: req.user._id, // Set by protect middleware
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      receiptNo,
      transaction,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. Get all Master Fees (for a summary list if needed)
exports.getAllMasterFees = async (req, res) => {
  try {
    const fees = await FeeMaster.find().sort({ applicableClass: 1 });
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching master fees" });
  }
};

exports.getFeesByClass = async (req, res) => {
  try {
    const { className } = req.params; // Extracts "Six" from the URL

    // Find the one blueprint defined for this class
    const feeStructure = await FeeMaster.findOne({
      applicableClass: className,
    });

    if (!feeStructure) {
      // If the Super Admin hasn't set up fees for Class Six yet, return 404
      return res
        .status(404)
        .json({ message: `No fee blueprint found for Class ${className}` });
    }

    res.status(200).json(feeStructure); //
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching fee structure", error: error.message });
  }
};
