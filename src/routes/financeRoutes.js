const router = require("express").Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getFeesByClass,
  collectFees,
  saveBulkFeeMaster,
  getAllMasterFees,
} = require("../controllers/financeController");

// Super-admin Bulk Setup
router.post("/master-fees/bulk", protect, admin, saveBulkFeeMaster);
router.get("/master-fees-list", protect, admin, getAllMasterFees);

// Collection
router.get("/structure/:className", protect, getFeesByClass);
router.post("/collect", protect, collectFees);

module.exports = router;
