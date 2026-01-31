const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");
const uploadBrand = require("../middlewares/uploadBrand");
const middleWare = require("../middlewares/middleware")

// CREATE BRAND
router.post(
    "/",
    middleWare.authMiddleware,
    middleWare.adminMiddleware,
    uploadBrand.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    brandController.createBrand,

);

// GET ALL
router.get("/", brandController.getAllBrands);

router.get("/:slug", brandController.getBrandBySlug);

// GET BY ID
router.get("/:id", brandController.getBrandById);

// UPDATE BRAND
router.put(
    "/:id",
    middleWare.authMiddleware,
    middleWare.adminMiddleware,
    uploadBrand.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    brandController.updateBrand
);

// DELETE BRAND
router.delete("/:id", middleWare.authMiddleware, middleWare.adminMiddleware,
    brandController.deleteBrand);




module.exports = router;
