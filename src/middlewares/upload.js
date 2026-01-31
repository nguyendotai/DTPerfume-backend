const multer = require("multer");
const path = require("path");

// lưu file tạm để upload lên Cloudinary
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
