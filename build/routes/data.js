const express = require("express");
const router = express.Router();
const {
  getMinorsInfo,
  newMinorInfo,
  editMinorInfo,
  removeMinorInfo,
  newPsyTestInfo,
  editPsyTestInfo,
  getInventoryInfo,
  editInventoryInfo,
  newInventoryInfo,
  removeInventoryInfo,
  getStreetAndCommunity,
  getFocusArea,
  downloadMinorInfo,
  getRecordIn,
  getRecordOut,
  getMinorsCategoryCount,
  newSomeInventoryInfo,
} = require("../controllers/data");

router.post("/get-minors", getMinorsInfo);
router.post("/new-minor", newMinorInfo);
router.post("/edit-minor", editMinorInfo);
router.post("/remove-minor", removeMinorInfo);
router.post("/new-psytest", newPsyTestInfo);
router.post("/edit-psytest", editPsyTestInfo);

router.post("/get-inventory", getInventoryInfo);
router.post("/new-inventory", newInventoryInfo);
router.post("/new-patch-inventory", newSomeInventoryInfo);
router.post("/edit-inventory", editInventoryInfo);
router.post("/remove-inventory", removeInventoryInfo);

router.get("/get-street", getStreetAndCommunity);
router.get("/get-areas", getFocusArea);
router.get("/download-minor", downloadMinorInfo);
router.post("/record-in", getRecordIn);
router.post("/record-out", getRecordOut);
router.get("/category-count", getMinorsCategoryCount);
module.exports = router;
