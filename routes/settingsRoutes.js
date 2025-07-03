const express = require("express");
const { createSettings, uploadSettingsImages, getSettings, getSettingsById, deleteSettings, editSetting,uploadMiddleware } = require("../controller/settingsController");
const {uploadSiteImages} = require("../middleware/multer");

const router = express.Router();

router.post('/settings/create',uploadSiteImages, createSettings);
router.post('/settings/upload-images', uploadMiddleware, uploadSettingsImages);
router.get('/settings/all', getSettings);
router.get('/settings/:id', getSettingsById);
router.put("/settings/update/:id", uploadSiteImages, uploadSettingsImages);
router.put('/settings/edit/:id', editSetting);
router.delete('/settings/delete/:id', deleteSettings);

module.exports = router;