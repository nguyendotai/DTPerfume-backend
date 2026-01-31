const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories", // thư mục trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const uploadCategoryImage = multer({ storage });

module.exports = uploadCategoryImage;
