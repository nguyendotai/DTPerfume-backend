const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const oderRoutes = require("./routes/orderRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const cartRoutes = require("./routes/cartRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const brandRoutes = require("./routes/brandRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // FE
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/api/stripe/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", oderRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/reviews", reviewRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

module.exports = app;
