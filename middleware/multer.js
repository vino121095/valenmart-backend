const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Allowed file types based on usage
const fileTypes = {
  images: /jpeg|jpg|png/,
  documents: /pdf|doc|docx/,
  videos: /mp4|mov|avi|mkv/,
  all: /jpeg|jpg|png|mp4|mov|avi|mkv|pdf|doc|docx/,
  templates: /jpeg|jpg|png|pdf|doc|docx/  // Templates formats
};

// Dynamic file filter based on usage
const getFileFilter = (usage) => {
  return (req, file, cb) => {
    const extname = fileTypes[usage].test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes[usage].test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error(`Invalid file type. Allowed formats: ${fileTypes[usage]}`));
  };
};

// Local storage configuration
const getLocalStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(`./uploads/${folder}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

// Upload profile image middleware (JPEG, JPG, PNG only)
const uploadProfileImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("profile_images");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("profile_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

// Upload delivery person image middleware (JPEG, JPG, PNG only)
const uploadDriverImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("driver_image");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("driver_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

// Upload multiple template files middleware (JPEG, JPG, PNG, PDF, DOC, DOCX)
const uploadIdProof = (req, res, next) => {
  const upload = multer({
    storage: getLocalStorage("id_proof"),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: getFileFilter("templates"),
  }).fields([{ name: "id_proof", maxCount: 10 }]);

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

// Combined upload middleware for driver_image and id_proof
const uploadDriverAndIdProof = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folder = "";
      if (file.fieldname === "driver_image") {
        folder = "driver_image";
      } else if (file.fieldname === "id_proof") {
        folder = "id_proof";
      }
      const uploadPath = path.join(`./uploads/${folder}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "driver_image") {
        return getFileFilter("images")(req, file, cb);
      } else if (file.fieldname === "id_proof") {
        return getFileFilter("templates")(req, file, cb);
      } else {
        cb(new Error("Unexpected field"));
      }
    },
  }).fields([
    { name: "driver_image", maxCount: 1 },
    { name: "id_proof", maxCount: 10 },
  ]);

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

const uploadProductImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("product_image");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("product_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

const uploadProcurementProductImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("procurement_product_image");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("procurement_product_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

const uploadDeliveryStatusImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("delivery_image");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("delivery_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

// Upload site images middleware (JPEG, JPG, PNG only)
const uploadSiteImages = (req, res, next) => {
  try {
    const storage = getLocalStorage("settings_images");

    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
      fileFilter: getFileFilter("images"),
    }).fields([
      { name: "site_icon", maxCount: 1 },
      { name: "site_logo", maxCount: 1 },
      { name: "site_dark_logo", maxCount: 1 },
    ]);

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

// Upload category image middleware (JPEG, JPG, PNG only)
const uploadCategoryImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("category_image");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("category_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

module.exports = {
  uploadProfileImage,
  uploadDriverImage,
  uploadIdProof,
  uploadDriverAndIdProof,
  uploadProductImage,
  uploadDeliveryStatusImage,
  uploadSiteImages,
  uploadCategoryImage,
  uploadProcurementProductImage
};