const Cart = require("../models/Carts");
const CartItem = require("../models/CartItems");
const ProductVariant = require("../models/ProductVariants");
const Product = require("../models/Products");
const ProductImage = require("../models/ProductImages");
const Brand = require("../models/Brands");

exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user.id; // middleware đã decode token
    const { variant_id, quantity } = req.body;

    if (!variant_id || !quantity)
      return res.status(400).json({ message: "Thiếu dữ liệu" });

    // Tìm hoặc tạo cart cho user
    let cart = await Cart.findOne({ where: { user_id } });

    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    // Kiểm tra item đã có trong cart chưa
    let item = await CartItem.findOne({
      where: { cart_id: cart.id, variant_id }
    });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        cart_id: cart.id,
        variant_id,
        quantity
      });
    }

    return res.json({ message: "Đã thêm vào giỏ hàng", item });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server lỗi" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      // Nếu FE gửi số <= 0 -> xóa luôn item
      await CartItem.destroy({ where: { id: item_id } });
      return res.json({ message: "Item đã bị xóa" });
    }

    const item = await CartItem.findByPk(item_id);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy item" });
    }

    item.quantity = quantity;
    await item.save();

    return res.json({
      message: "Cập nhật số lượng thành công",
      item
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server lỗi" });
  }
};


exports.removeItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    const item = await CartItem.findByPk(item_id);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy item" });

    await item.destroy();

    return res.json({ message: "Đã xóa item" });
  } catch (err) {
    return res.status(500).json({ message: "Server lỗi" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const cart = await Cart.findOne({ where: { user_id } });
    if (!cart)
      return res.json({ message: "Giỏ đã trống" });

    await CartItem.destroy({ where: { cart_id: cart.id } });

    return res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (err) {
    return res.status(500).json({ message: "Server lỗi" });
  }
};

exports.getCart = async (req, res) => {
  const user_id = req.user.id;

  const cart = await Cart.findOne({
    where: { user_id },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [
          {
            model: ProductVariant,
            as: "variant",
            include: [
              {
                model: Product,
                as: "product",
                include: [
                  { model: Brand, as: "brand" },
                  { model: ProductImage, as: "images" }
                ]
              },
              {
                model: ProductImage,
                as: "variantImages"
              }
            ]
          }
        ]
      }
    ]
  });

  return res.json({
    items: cart ? cart.items : []
  });
};


exports.syncCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { items } = req.body; // danh sách cart local FE

    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    const dbItems = await CartItem.findAll({
      where: { cart_id: cart.id }
    });

    const mapDB = new Map();
    dbItems.forEach(item => mapDB.set(item.variant_id, item));

    for (const item of items) {
      if (mapDB.has(item.variant_id)) {
        const exist = mapDB.get(item.variant_id);
        exist.quantity += item.quantity;
        await exist.save();
      } else {
        await CartItem.create({
          cart_id: cart.id,
          variant_id: item.variant_id,
          quantity: item.quantity
        });
      }
    }

    return res.json({ message: "Đã sync giỏ hàng" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server lỗi" });
  }
};
