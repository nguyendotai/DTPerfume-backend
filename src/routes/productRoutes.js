const express = require("express");
const productController = require("../controllers/productControlller")
const middleWare = require("../middlewares/middleware");
const upload = require("../middlewares/upload");
const router = express.Router();

const fields = [
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 10 },
    { name: "variantImages-0", maxCount: 5 },
    { name: "variantImages-1", maxCount: 5 },
    { name: "variantImages-2", maxCount: 5 },
    { name: "variantImages-3", maxCount: 5 },
    { name: "variantImages-4", maxCount: 5 },
];

router.post(
    "/",
    middleWare.authMiddleware,
    middleWare.adminMiddleware,
    upload.fields(fields),
    productController.createProduct
);

router.put(
    "/:slug",
    middleWare.authMiddleware,
    middleWare.adminMiddleware,
    upload.fields(fields),
    productController.updateProductBySlug
);

router.delete(
    "/:slug",
    middleWare.authMiddleware,
    middleWare.adminMiddleware,
    productController.deleteProductBySlug
);


// Lấy tất cả sản phẩm
router.get("/", productController.getAllProducts);

router.get("/new-arrivals", productController.getNewArrivals);

router.get("/bestsellers", productController.getBestsellers);

router.get("/category/:slug", productController.getProductsByCategory);

router.get("/search", productController.searchProducts);

router.get("/brand/:slug", productController.getProductsByBrand);

// Lấy chi tiết sản phẩm theo id
router.get("/:slug", productController.getProductBySlug);

module.exports = router;