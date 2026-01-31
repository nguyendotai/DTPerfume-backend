const express = require("express");
const router = express.Router();
const cartCtrl = require("../controllers/cartController");
const middleware = require("../middlewares/middleware");

router.post("/add", middleware.authMiddleware, cartCtrl.addToCart);
router.get("/", middleware.authMiddleware, cartCtrl.getCart);
router.post("/sync", middleware.authMiddleware, cartCtrl.syncCart);
router.delete("/clear", middleware.authMiddleware, cartCtrl.clearCart);

router.put("/item/:item_id", middleware.authMiddleware, cartCtrl.updateQuantity);

router.delete("/item/:item_id", middleware.authMiddleware, cartCtrl.removeItem);

module.exports = router;
