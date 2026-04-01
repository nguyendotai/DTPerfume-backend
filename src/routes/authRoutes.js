const express = require("express");
const authController = require("../controllers/authController");
const middleWare = require("../middlewares/middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.loginUser);
router.post("/admin/login", authController.loginAdmin);

router.get("/me", middleWare.authMiddleware, authController.getMe);

router.put("/update", middleWare.authMiddleware, authController.updateProfile);

router.post("/logout", middleWare.authMiddleware, authController.logout);

router.get("/", middleWare.authMiddleware, middleWare.adminMiddleware, authController.getAllUsers);
router.get("/:id", middleWare.authMiddleware, middleWare.adminMiddleware, authController.getUserById);
router.put("/:id", middleWare.authMiddleware, middleWare.adminMiddleware, authController.updateUserByAdmin);
router.put("/:id/role", middleWare.authMiddleware, middleWare.adminMiddleware, authController.changeRole);
router.put("/:id/status", middleWare.authMiddleware, middleWare.adminMiddleware, authController.toggleUserStatus);

module.exports = router;