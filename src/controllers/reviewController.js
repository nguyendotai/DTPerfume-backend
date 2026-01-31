const Review = require("../models/reviews");
const User = require("../models/Users");
const Product = require("../models/Products");

/* CREATE REVIEW */
exports.createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating || !comment) {
      return res.status(400).json({ message: "Thiếu dữ liệu đánh giá!" });
    }

    // (Optional) Không cho đánh giá trùng 1 sản phẩm
    const exists = await Review.findOne({
      where: { user_id, product_id },
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá sản phẩm này rồi!" });
    }

    const review = await Review.create({
      user_id,
      product_id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* GET REVIEWS BY PRODUCT */
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* GET REVIEWS BY USER */
exports.getMyReviews = async (req, res) => {
  try {
    const user_id = req.user.id;

    const reviews = await Review.findAll({
      where: { user_id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* UPDATE REVIEW */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    const review = await Review.findByPk(id);
    if (!review)
      return res.status(404).json({ message: "Không tìm thấy đánh giá!" });

    if (review.user_id !== user_id)
      return res.status(403).json({ message: "Không có quyền sửa đánh giá!" });

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* DELETE REVIEW */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const review = await Review.findByPk(id);
    if (!review)
      return res.status(404).json({ message: "Không tìm thấy đánh giá!" });

    if (review.user_id !== user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Không có quyền xóa đánh giá!" });
    }

    await review.destroy();

    res.json({ success: true, message: "Xóa đánh giá thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
