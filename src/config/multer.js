const multer = require("multer");
const path = require("path");

// Lưu tạm ảnh vào thư mục uploads/ trước khi đẩy lên Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, ""));
  },
});

const upload = multer({ storage });

module.exports = upload;
