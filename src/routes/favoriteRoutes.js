const express = require("express");
const router = express.Router();
const favoriteCtrl = require("../controllers/favoriteController");
const middleware = require("../middlewares/middleware");

router.post("/add", middleware.authMiddleware, favoriteCtrl.addToFavorite);
router.get("/", middleware.authMiddleware, favoriteCtrl.getFavorite);
router.post("/sync", middleware.authMiddleware, favoriteCtrl.syncFavorite);

router.delete("/item/:item_id", middleware.authMiddleware, favoriteCtrl.removeItem);

module.exports = router;
