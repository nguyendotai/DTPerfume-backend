const sequelize = require("../config/database");

// Import tất cả model
const User = require("./Users");
const Order = require("./Orders");
const OrderItem = require("./OrderItems");
const Category = require("./Categories");
const Cart = require("./Carts");
const CartItem = require("./CartItems");
const ProductImage = require("./ProductImages");
const Product = require("./Products");
const ProductVariant = require("./ProductVariants");
const ProductCategory = require("./ProductCategory");
const Review = require("./reviews");

Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
ProductVariant.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product.belongsToMany(Category, { through: ProductCategory, foreignKey: "product_id", as: "categories" });
Category.belongsToMany(Product, { through: ProductCategory, foreignKey: "category_id", as: "products" });

User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });

ProductVariant.hasMany(CartItem, { foreignKey: "variant_id", as: "cartItems" });
CartItem.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

ProductVariant.hasMany(OrderItem, { foreignKey: "variant_id", as: "orderItems" });
OrderItem.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });

const syncDB = async () => {
  try {
    // await sequelize.sync({ alter: true });
    await sequelize.sync();
    console.log("All models synced successfully!");
  } catch (error) {
    console.error("Sync failed:", error);
  }
};

module.exports = { sequelize, syncDB, User };
