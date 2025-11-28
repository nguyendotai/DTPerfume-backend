const express = require("express");
const categoryController = require("../controllers/categoryController")
const middleWare = require("../middlewares/middleware");
const router = express.Router();

router.get("/", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.getAllCategory);
router.get("/:slug", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.getCategoryBySlug)
router.post("/", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.createCategory);
router.put("/:slug", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.updateCategory);
router.delete("/:slug", middleWare.authMiddleware, middleWare.adminMiddleware, categoryController.deleteCategory)

module.exports = router;