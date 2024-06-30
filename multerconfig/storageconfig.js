const multer = require("multer");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    const filename = `image-${Date.now()}-${file.originalname}`;
    callback(null, filename);
  },
});

// File filter
const filefilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
    callback(new Error("Only .jpg, .png, and .jpeg files are allowed"));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: filefilter,
});

module.exports = upload;
