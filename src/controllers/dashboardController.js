const { Op, fn, col } = require("sequelize");
const User = require("../models/Users");
const Order = require("../models/Orders");
const OrderItem = require("../models/OrderItems");
const Product = require("../models/Products");
const ProductVariant = require("../models/ProductVariants");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Order.sum("total_price");

    const newOrdersCount = await Order.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalProducts = await Product.count();

    const newUsersCount = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    const topPerfumes = await OrderItem.findAll({
      attributes: [
        "variant_id",
        [fn("SUM", col("quantity")), "totalSold"],
      ],
      group: ["variant_id", "variant.id", "variant->product.id"],
      order: [[fn("SUM", col("quantity")), "DESC"]],
      limit: 5,
      include: [
        {
          model: ProductVariant,
          as: "variant",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    res.json({
      stats: {
        totalRevenue: totalRevenue || 0,
        newOrders: newOrdersCount,
        totalProducts,
        newUsers: newUsersCount,
      },
      recentOrders,
      topPerfumes,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
