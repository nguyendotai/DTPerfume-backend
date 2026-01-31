const express = require("express");
const reviewController = require("../controllers/reviewController");
const middleware = require("../middlewares/middleware");

const router = express.Router();

/* PUBLIC */
router.get("/product/:productId", reviewController.getReviewsByProduct);

/* AUTH REQUIRED */
router.post("/", middleware.authMiddleware, reviewController.createReview);
router.get("/me", middleware.authMiddleware, reviewController.getMyReviews);
router.put("/:id", middleware.authMiddleware, reviewController.updateReview);
router.delete("/:id", middleware.authMiddleware, reviewController.deleteReview);

module.exports = router;
