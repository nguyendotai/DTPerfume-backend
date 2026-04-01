const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/Orders");
const OrderItem = require("../models/OrderItems");
const ProductVariant = require("../models/ProductVariants");
const Product = require("../models/Products");
const Cart = require("../models/Carts");

const EXCHANGE_RATE = 25000;
const USD_TO_CENTS = 100;

exports.createCheckout = async (req, res) => {
  try {
    const { items, user_id, shipping_address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng rỗng" });
    }

    // --------------------------------------------
    // 1. Lấy tất cả variant trong 1 query duy nhất
    // --------------------------------------------
    const variantIds = items.map(i => i.variant_id);

    const variants = await ProductVariant.findAll({
      where: { id: variantIds },
      include: [{ model: Product, as: "product" }]
    });

    if (variants.length !== items.length) {
      return res.status(404).json({ message: "Một số variant không tồn tại" });
    }

    // --------------------------------------------
    // 2. Tính tổng tiền (VND)
    // --------------------------------------------
    let totalPriceVND = 0;

    const orderItemsData = items.map(item => {
      const variant = variants.find(v => v.id === item.variant_id);

      const price = Number(item.price);
      const quantity = item.quantity;

      totalPriceVND += price * quantity;

      return {
        variant_id: item.variant_id,
        price,
        quantity
      };
    });


    // --------------------------------------------
    // 3. Tạo order pending
    // --------------------------------------------
    const order = await Order.create({
      user_id: user_id || null,
      total_price: totalPriceVND,
      discount: 0,
      status: "pending",
      payment_method: "stripe",
      shipping_address: shipping_address
    });

    // 🔔 REALTIME NOTIFICATION
    if (global.io) {
      global.io.emit("new-notification", {
        id: Date.now(),
        message: `Đơn hàng mới #${order.id}`,
        type: "order",
        createdAt: new Date(),
      });
    };

    // --------------------------------------------
    // 4. Tạo order items
    // --------------------------------------------
    for (const oi of orderItemsData) {
      await OrderItem.create({
        order_id: order.id,
        variant_id: oi.variant_id,
        price: oi.price,
        quantity: oi.quantity,
      });
    }

    // --------------------------------------------
    // 4.1 XÓA GIỎ HÀNG TRONG DB (nếu user đăng nhập)
    // --------------------------------------------
    if (user_id) {
      await Cart.destroy({
        where: { user_id },
      });
    }



    // --------------------------------------------
    // 5. Tạo line items Stripe (convert VND → USD → cents)
    // --------------------------------------------
    const lineItems = items.map(item => {
      const variant = variants.find(v => v.id === item.variant_id);

      const priceVND =
        Number(item.price);

      const priceUSD = priceVND / EXCHANGE_RATE;
      const amountInCents = Math.round(priceUSD * USD_TO_CENTS);


      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${variant.product.name} - ${variant.volume_ml}ml`,
          },
          unit_amount: amountInCents,
        },
        quantity: item.quantity,
      };
    });

    // --------------------------------------------
    // 6. Stripe checkout session
    // --------------------------------------------
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3000/payment-success?order_id=${order.id}`,
      cancel_url: `http://localhost:3000/payment-cancel`,
      metadata: {
        order_id: order.id,
      },
    });


    return res.status(200).json({
      url: session.url,
      order_id: order.id
    });

  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: error.message || "Lỗi khi tạo đơn hàng" });
  }
};

exports.createCODOrder = async (req, res) => {
  try {
    const { items, user_id, shipping_address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng rỗng" });
    }

    let totalPriceVND = 0;
    items.forEach(item => {
      totalPriceVND += Number(item.price) * item.quantity;
    });

    const order = await Order.create({
      user_id: user_id || null,
      total_price: totalPriceVND,
      discount: 0,
      status: "pending",
      payment_method: "cod",
      shipping_address,
    });

    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        variant_id: item.variant_id,
        price: item.price,
        quantity: item.quantity,
      });
    }

    if (user_id) {
      await Cart.destroy({
        where: { user_id },
      });
    };

    if (global.io) {
      global.io.emit("new-notification", {
        id: Date.now(),
        message: `Đơn hàng mới #${order.id}`,
        type: "order",
        createdAt: new Date(),
      });
    }


    return res.status(201).json({
      message: "Đặt hàng COD thành công",
      order_id: order.id,
    });
  } catch (error) {
    console.error("COD checkout error:", error);
    res.status(500).json({ message: "Lỗi khi tạo đơn COD" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await Order.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
      include: [
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
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Không thể lấy danh sách đơn hàng" });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id, {
      include: [
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
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    return res.status(200).json({
      data: order,
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({ message: "Không thể lấy chi tiết đơn hàng" });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByPk(order_id, {
      attributes: ["id", "status", "payment_method", "createdAt", "total_price"],
    });

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    return res.status(200).json({
      data: order,
    });
  } catch (error) {
    console.error("Get order status error:", error);
    res.status(500).json({ message: "Không thể lấy trạng thái đơn hàng" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    };

    if (global.io) {
      global.io.emit("new-notification", {
        id: Date.now(),
        message: `Đơn #${order.id} chuyển sang ${status}`,
        type: "order-status",
        createdAt: new Date(),
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Không thể cập nhật trạng thái đơn hàng" });
  }
};

exports.confirmStripePayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.payment_method !== "stripe") {
      return res.status(400).json({ message: "Đơn hàng này không dùng Stripe" });
    }

    order.status = "paid";
    await order.save();

    return res.status(200).json({
      message: "Thanh toán thành công",
      data: order,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Lỗi xác nhận thanh toán" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
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
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Không thể lấy danh sách đơn hàng" });
  }
};
