const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter (optional, can be customized)
const fileFilter = (req, file, cb) => {
  // Accept all files for now
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
