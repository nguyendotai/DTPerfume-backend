const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `brand-${file.fieldname}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    return cb(new Error("Chỉ cho phép upload ảnh"), false);
  }
  cb(null, true);
};

const uploadBrand = multer({
  storage,
  fileFilter,
});

module.exports = uploadBrand;
