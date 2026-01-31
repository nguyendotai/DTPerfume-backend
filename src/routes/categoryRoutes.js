const express = require("express");
const categoryController = require("../controllers/categoryController")
const middleWare = require("../middlewares/middleware");
const uploadCategoryImage = require("../middlewares/uploadCategoryImage");
const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);
router.get("/admin/:slug", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.getCategoryBySlug)
router.post("/", middleWare.authMiddleware, middleWare.adminMiddleware, uploadCategoryImage.single("image"), categoryController.createCategory);
router.put("/:slug", middleWare.authMiddleware, middleWare.adminMiddleware, uploadCategoryImage.single("image"), categoryController.updateCategory);
router.delete("/:slug", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.deleteCategory)

module.exports = router;