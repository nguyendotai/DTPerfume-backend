const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

router.post("/create-checkout", orderController.createCheckout);
router.post("/create-cod", orderController.createCODOrder);

// 🆕 Theo dõi đơn hàng
router.get("/user/:user_id", orderController.getUserOrders);        // danh sách đơn hàng của user
router.get("/:order_id", orderController.getOrderDetail);          // chi tiết 1 đơn
router.get("/status/:order_id", orderController.getOrderStatus);   // trạng thái đơn hàng
router.post("/confirm-stripe-payment", orderController.confirmStripePayment);

// 🔧 Admin cập nhật trạng thái
router.put("/:order_id/status", orderController.updateOrderStatus);

module.exports = router;
