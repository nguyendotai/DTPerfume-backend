const express = require("express");
const reviewController = require("../controllers/authControllers");
const middleWare = require("../middlewares/middleware");

const router = express.Router();

router.post("/register", reviewController.register);
router.post("/login", reviewController.loginUser);
router.post("/admin/login", reviewController.loginAdmin);

router.get("/me", middleWare.authMiddleware, reviewController.getMe)

router.put("/update", middleWare.authMiddleware, reviewController.updateProfile);

module.exports = router;