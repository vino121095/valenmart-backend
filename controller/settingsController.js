const Setting = require("../model/settings");
const multer = require("multer");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/'); // Make sure this directory exists
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Create multer middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Middleware to handle multiple file uploads
const uploadMiddleware = (req, res, next) => {
  const uploadFiles = upload.fields([
    { name: 'site_icon', maxCount: 1 },
    { name: 'site_logo', maxCount: 1 },
    { name: 'site_dark_logo', maxCount: 1 }
  ]);

  uploadFiles(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: `Unknown error: ${err.message}` });
    }
    // Everything went fine
    next();
  });
};

const createSettings = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const { site_icon, site_logo, site_dark_logo } = req.files || {};
    const {
      site_name,
      site_description,
      contact_mail,
      facebook_url,
      instagram_url,
      linkedin_url,
      youtube_url,
      about,
      contact_no,
    } = req.body;

    // Ensure site_name is properly parsed
    const parsedSiteName = site_name ? site_name.toString().trim() : null;

    // Validate required fields
    if (!parsedSiteName) {
      return res.status(400).json({ message: "site_name is required" });
    }

    // Check if settings already exist (assuming only one record is required)
    let existingSettings = await Setting.findOne();

    // If no settings exist, create a new one
    if (!existingSettings) {
      existingSettings = await Setting.create({
        site_name: parsedSiteName,
        site_description,
        contact_mail,
        facebook_url,
        instagram_url,
        linkedin_url,
        youtube_url,
        about,
        contact_no
      });
    } else {
      // Update the existing settings
      existingSettings.site_name = parsedSiteName;
      existingSettings.site_description = site_description || existingSettings.site_description;
      existingSettings.contact_mail = contact_mail || existingSettings.contact_mail;
      existingSettings.facebook_url = facebook_url || existingSettings.facebook_url;
      existingSettings.instagram_url = instagram_url || existingSettings.instagram_url;
      existingSettings.linkedin_url = linkedin_url || existingSettings.linkedin_url;
      existingSettings.youtube_url = youtube_url || existingSettings.youtube_url;
      existingSettings.about = about || existingSettings.about;
      existingSettings.contact_no = contact_no || existingSettings.contact_no;
    }

    // Attach file paths if uploaded
    if (site_icon && site_icon[0]) {
      existingSettings.site_icon = site_icon[0]?.path || site_icon[0]?.location;
    }

    if (site_logo && site_logo[0]) {
      existingSettings.site_logo = site_logo[0]?.path || site_logo[0]?.location;
    }

    if (site_dark_logo && site_dark_logo[0]) {
      existingSettings.site_dark_logo = site_dark_logo[0]?.path || site_dark_logo[0]?.location;
    }

    // Save the changes (whether new or updated)
    await existingSettings.save();

    res.status(200).json({
      message: "Settings processed successfully",
      settings: existingSettings
    });
  } catch (error) {
    console.error("Error processing settings:", error);
    res.status(500).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();

    if (settings.length === 0) {
      return res.status(404).json({ message: "No settings found" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSettingsById = async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await Setting.findByPk(id);

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editSetting = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request params
    const {
      storage_type,
      site_name,
      site_description,
      contact_mail,
      facebook_url,
      instagram_url,
      linkedin_url,
      youtube_url,
      about,
      contact_no,
    } = req.body; // Get the updated values from the request body

    // Find the setting by ID
    const setting = await Setting.findByPk(id);

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    // Update the setting fields
    setting.storage_type = storage_type || setting.storage_type;
    setting.site_name = site_name || setting.site_name;
    setting.site_description = site_description !== undefined ? site_description : setting.site_description;
    setting.contact_mail = contact_mail !== undefined ? contact_mail : setting.contact_mail;
    setting.facebook_url = facebook_url !== undefined ? facebook_url : setting.facebook_url;
    setting.instagram_url = instagram_url !== undefined ? instagram_url : setting.instagram_url;
    setting.linkedin_url = linkedin_url !== undefined ? linkedin_url : setting.linkedin_url;
    setting.youtube_url = youtube_url !== undefined ? youtube_url : setting.youtube_url;
    setting.about = about !== undefined ? about : setting.about;
    setting.contact_no = contact_no !== undefined ? contact_no : setting.contact_no;

    // Save the updated setting
    await setting.save();

    return res.status(200).json({
      message: "Setting updated successfully",
      setting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the setting",
      error: error.message,
    });
  }
};

const uploadSettingsImages = async (req, res) => {
  try {
    console.log("Request Files:", req.files);
    const { site_icon, site_logo, site_dark_logo } = req.files || {};

    // Find settings to update
    let settings = await Setting.findOne();
    
    if (!settings) {
      return res.status(404).json({ message: "Settings not found. Please create settings first." });
    }

    const updatedData = {};

    // Update image paths if files were uploaded
    if (site_icon && site_icon[0]) {
      updatedData.site_icon = site_icon[0]?.path || site_icon[0]?.location;
      settings.site_icon = updatedData.site_icon;
    }
    
    if (site_logo && site_logo[0]) {
      updatedData.site_logo = site_logo[0]?.path || site_logo[0]?.location;
      settings.site_logo = updatedData.site_logo;
    }
    
    if (site_dark_logo && site_dark_logo[0]) {
      updatedData.site_dark_logo = site_dark_logo[0]?.path || site_dark_logo[0]?.location;
      settings.site_dark_logo = updatedData.site_dark_logo;
    }

    // Save the updated settings
    await settings.save();

    res.status(200).json({
      message: "Site images updated successfully",
      images: updatedData,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Setting.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({ message: "Settings deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSettings,
  getSettings,
  getSettingsById,
  uploadSettingsImages,
  deleteSettings,
  editSetting,
  uploadMiddleware
};