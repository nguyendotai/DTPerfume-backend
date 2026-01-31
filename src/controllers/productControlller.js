const Product = require("../models/Products");
const ProductVariant = require("../models/ProductVariants");
const ProductImage = require("../models/ProductImages");
const Category = require("../models/Categories");
const Review = require("../models/reviews");
const Brand = require("../models/Brands");
const OrderItem = require("../models/OrderItems");
const { sequelize } = require("../models/index");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");

// =============================
// 1️⃣ Lấy tất cả sản phẩm
// =============================
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductVariant,
                    as: "variants",
                    include: [
                        {
                            model: ProductImage,
                            as: "variantImages",
                            required: false,
                        },
                    ],
                },
                {
                    model: ProductImage,
                    as: "images",
                    where: { variant_id: null },
                    required: false,
                },
                {
                    model: Category,
                    as: "categories",
                },
                {
                    model: Review,
                    as: "reviews",
                },
                { model: Brand, as: "brand", attributes: ["id", "name", "logo"] },
            ],
            order: [["createdAt", "DESC"]],
        });


        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

// =============================
// 🔥 New Arrivals
// =============================
exports.getNewArrivals = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        const products = await Product.findAll({
            limit,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: ProductVariant,
                    as: "variants",
                    include: [
                        {
                            model: ProductImage,
                            as: "variantImages",
                            required: false,
                        },
                    ],
                },
                {
                    model: ProductImage,
                    as: "images",
                    where: { variant_id: null },
                    required: false,
                },
                { model: Brand, as: "brand", attributes: ["id", "name", "logo"] },
            ],
        });

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching new arrivals:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch new arrivals",
        });
    }
};

// =============================
// 🔥 Bestsellers
// =============================
exports.getBestsellers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        const bestsellers = await OrderItem.findAll({
            attributes: [
                [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
            ],
            include: [
                {
                    model: ProductVariant,
                    as: "variant",
                    attributes: ["id", "product_id"],
                    include: [
                        {
                            model: Product,
                            as: "product",
                            include: [
                                {
                                    model: ProductVariant,
                                    as: "variants",
                                    include: [
                                        {
                                            model: ProductImage,
                                            as: "variantImages",
                                            required: false,
                                        },
                                    ],
                                },
                                {
                                    model: ProductImage,
                                    as: "images",
                                    where: { variant_id: null },
                                    required: false,
                                },
                                { model: Brand, as: "brand", attributes: ["id", "name", "logo"] },
                            ],
                        },
                    ],
                },
            ],
            group: ["variant.product_id"],
            order: [[sequelize.literal("totalSold"), "DESC"]],
            limit,
            subQuery: false,
        });

        // Lọc ra product
        const products = bestsellers.map(item => item.variant.product);

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching bestsellers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bestsellers",
        });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const limit = Number(req.query.limit) || 10;

        const category = await Category.findOne({
            where: { slug, isActive: true },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy danh mục",
            });
        }

        const products = await Product.findAll({
            where: { status: true },
            include: [
                {
                    model: Category,
                    as: "categories",
                    where: { id: category.id },
                    through: { attributes: [] },
                },
                {
                    model: Brand,
                    as: "brand",
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    attributes: ["price", "discount_price"],
                    limit: 1, // 👈 lấy 1 variant để show giá
                    order: [["price", "ASC"]],
                },
                {
                    model: ProductImage,
                    as: "images",
                },
            ],
            limit,
            order: [["createdAt", "DESC"]],
        });

        return res.json({
            success: true,
            data: products,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

// =============================
// 2️⃣ Lấy chi tiết 1 sản phẩm theo ID
// =============================
exports.getProductBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const product = await Product.findOne({
            where: { slug },
            include: [
                { model: ProductVariant, as: "variants", include: [{ model: ProductImage, as: "variantImages" }] },
                { model: ProductImage, as: "images" },
                { model: Category, as: "categories" },
                {
                    model: Review,
                    as: "reviews",
                    include: [{ model: require("../models/Users"), as: "user" }]
                },
            ],
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết sản phẩm",
            error: error.message,
        });
    }
};


exports.createProduct = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        let categories = [];
        let variants = [];

        // Parse JSON an toàn
        try {
            categories = JSON.parse(req.body.categories || "[]");
            variants = JSON.parse(req.body.variants || "[]");
        } catch (e) {
            return res.status(400).json({ message: "Invalid JSON format" });
        }

        // 1️⃣ Tạo sản phẩm
        const product = await Product.create({
            name: req.body.name,
            slug: req.body.slug,
            type: req.body.type,
            description: req.body.description,
            brand_id: req.body.brand_id, // ✅ QUAN TRỌNG
            concentration: req.body.concentration,
            gender: req.body.gender,
            status: req.body.status === "true",
        }, { transaction: t });


        // 2️⃣ Gán danh mục
        if (categories.length > 0) {
            await product.setCategories(categories, { transaction: t });
        }

        // 3️⃣ Upload ảnh chính
        if (req.files?.mainImage) {
            const uploaded = await cloudinary.uploader.upload(
                req.files.mainImage[0].path,
                { folder: "dtperfume/main" }
            );

            await ProductImage.create({
                url: uploaded.secure_url,
                alt: product.name,
                is_main: true,
                product_id: product.id,
            }, { transaction: t });
        }

        // 4️⃣ Upload ảnh phụ
        if (req.files?.subImages) {
            const subImgs = [];

            for (const file of req.files.subImages) {
                const uploaded = await cloudinary.uploader.upload(file.path, {
                    folder: "dtperfume/sub",
                });

                subImgs.push({
                    url: uploaded.secure_url,
                    alt: product.name,
                    is_main: false,
                    product_id: product.id,
                });
            }

            await ProductImage.bulkCreate(subImgs, { transaction: t });
        }

        // 5️⃣ Tạo variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];

            const barcode = v.barcode || `BC-${Date.now()}-${i}`;

            const variant = await ProductVariant.create(
                {
                    ...v,
                    product_id: product.id,
                    barcode,
                },
                { transaction: t }
            );

            const variantFiles = req.files[`variantImages-${i}`] || [];

            if (variantFiles.length > 0) {
                const images = [];

                for (const file of variantFiles) {
                    const uploaded = await cloudinary.uploader.upload(
                        file.path,
                        { folder: "dtperfume/variants" }
                    );

                    images.push({
                        url: uploaded.secure_url,
                        alt: variant.sku,
                        is_main: false,
                        variant_id: variant.id,
                    });
                }

                await ProductImage.bulkCreate(images, { transaction: t });
            }
        }

        await t.commit();

        return res.status(201).json({
            success: true,
            message: "Product created successfully!",
            product,
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message,
        });
    }
};


exports.updateProductBySlug = async (req, res) => {
    const { slug } = req.params;
    const t = await sequelize.transaction();

    try {
        const product = await Product.findOne({
            where: { slug },
            include: [
                { model: ProductImage, as: "images" },
                {
                    model: ProductVariant,
                    as: "variants",
                    include: [{ model: ProductImage, as: "variantImages" }]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        // Parse JSON
        let categories = [];
        let variants = [];
        let keepImages = [];

        try {
            categories = JSON.parse(req.body.categories || "[]");
            variants = JSON.parse(req.body.variants || "[]");
            keepImages = JSON.parse(req.body.keepImages || "[]");
        } catch {
            return res.status(400).json({ message: "Invalid JSON format" });
        }

        // 1️⃣ Update product basic
        await product.update({
            name: req.body.name,
            slug: req.body.slug,
            type: req.body.type,
            description: req.body.description,
            brand_id: req.body.brand_id, // ✅
            concentration: req.body.concentration,
            gender: req.body.gender,
            status: req.body.status === "true",
        }, { transaction: t });


        // 2️⃣ Update categories
        await product.setCategories(categories, { transaction: t });

        // 3️⃣ Update main image
        const oldMain = product.images.find(img => img.is_main === true);

        if (req.files?.mainImage) {
            if (oldMain) {
                const cloudId = oldMain.url.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`dtperfume/main/${cloudId}`);
                await oldMain.destroy({ transaction: t });
            }

            const uploaded = await cloudinary.uploader.upload(
                req.files.mainImage[0].path,
                { folder: "dtperfume/main" }
            );

            await ProductImage.create({
                url: uploaded.secure_url,
                alt: product.name,
                is_main: true,
                product_id: product.id,
            }, { transaction: t });
        }

        // 4️⃣ Update sub images
        const oldSubs = product.images.filter(img => img.is_main === false);

        for (const img of oldSubs) {
            if (!keepImages.includes(img.url)) {
                const cloudId = img.url.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`dtperfume/sub/${cloudId}`);
                await img.destroy({ transaction: t });
            }
        }

        if (req.files?.subImages) {
            for (const file of req.files.subImages) {
                const uploaded = await cloudinary.uploader.upload(
                    file.path,
                    { folder: "dtperfume/sub" }
                );

                await ProductImage.create({
                    url: uploaded.secure_url,
                    alt: product.name,
                    is_main: false,
                    product_id: product.id,
                }, { transaction: t });
            }
        }

        // 5️⃣ Update variants
        const dbVariantIds = product.variants.map(v => v.id);
        const feVariantIds = variants.filter(v => v.id).map(v => v.id);

        // Xóa variant không còn trong FE
        for (const vId of dbVariantIds) {
            if (!feVariantIds.includes(vId)) {
                const variant = await ProductVariant.findByPk(vId, {
                    include: [{ model: ProductImage, as: "variantImages" }],
                });

                for (const img of variant.variantImages) {
                    const cloudId = img.url.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(`dtperfume/variants/${cloudId}`);
                    await img.destroy({ transaction: t });
                }

                await variant.destroy({ transaction: t });
            }
        }

        // Update or create variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            let variantRecord;

            if (v.id) {
                variantRecord = await ProductVariant.findByPk(v.id, {
                    include: [{ model: ProductImage, as: "variantImages" }],
                });

                await variantRecord.update(
                    {
                        volume_ml: v.volume_ml,
                        sku: v.sku,
                        price: v.price,
                        discount_price: v.discount_price,
                        stock: v.stock,
                        status: Boolean(v.status),
                        version: v.version ?? null, // ✅ THÊM DÒNG NÀY
                    },
                    { transaction: t }
                );


            } else {
                variantRecord = await ProductVariant.create({
                    ...v,
                    product_id: product.id,
                    barcode: v.barcode || `BC-${Date.now()}-${i}`,
                }, { transaction: t });
            }

            // Giữ ảnh variant
            const keepVariantImages = v.keepImages || [];

            for (const img of variantRecord.variantImages) {
                if (!keepVariantImages.includes(img.url)) {
                    const cloudId = img.url.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(`dtperfume/variants/${cloudId}`);
                    await img.destroy({ transaction: t });
                }
            }

            // Upload ảnh mới
            const variantFiles = req.files[`variantImages-${i}`] || [];

            for (const file of variantFiles) {
                const uploaded = await cloudinary.uploader.upload(file.path, {
                    folder: "dtperfume/variants",
                });

                await ProductImage.create({
                    url: uploaded.secure_url,
                    alt: variantRecord.sku,
                    is_main: false,
                    variant_id: variantRecord.id,
                }, { transaction: t });
            }
        }

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công!",
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
};


exports.deleteProductBySlug = async (req, res) => {
    const { slug } = req.params;
    const t = await sequelize.transaction();

    try {
        const product = await Product.findOne({
            where: { slug },
            include: [
                { model: ProductImage, as: "images" },
                {
                    model: ProductVariant,
                    as: "variants",
                    include: [{ model: ProductImage, as: "variantImages" }]
                }
            ],
            transaction: t
        });

        if (!product) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        // 1️⃣ Lưu lại danh sách ảnh để xóa SAU
        const cloudImages = [];

        if (product.main_image) {
            cloudImages.push({ folder: "main", url: product.main_image });
        }

        for (const img of product.images) {
            cloudImages.push({ folder: "sub", url: img.url });
            await img.destroy({ transaction: t });
        }

        for (const variant of product.variants) {
            for (const img of variant.variantImages) {
                cloudImages.push({ folder: "variants", url: img.url });
                await img.destroy({ transaction: t });
            }
            await variant.destroy({ transaction: t });
        }

        await product.destroy({ transaction: t });

        // 2️⃣ Commit DB TRƯỚC
        await t.commit();

        // 3️⃣ Sau đó mới xóa Cloudinary
        for (const img of cloudImages) {
            const cloudId = img.url.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`dtperfume/${img.folder}/${cloudId}`);
        }

        return res.json({ success: true, message: "Xóa sản phẩm thành công" });

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa sản phẩm",
            error: error.message
        });
    }
};

// =============================
// 🔍 Tìm kiếm sản phẩm theo từ khóa
// =============================
exports.searchProducts = async (req, res) => {
    try {
        const { keyword = "", page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const { rows: products, count } = await Product.findAndCountAll({
            where: {
                status: true,
                [Op.or]: [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } },
                ],
            },
            include: [
                {
                    model: Brand,
                    as: "brand",
                    where: keyword
                        ? { name: { [Op.like]: `%${keyword}%` } }
                        : undefined,
                    required: false,
                },
                {
                    model: Category,
                    as: "categories",
                    where: keyword
                        ? { name: { [Op.like]: `%${keyword}%` } }
                        : undefined,
                    through: { attributes: [] },
                    required: false,
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    include: [
                        {
                            model: ProductImage,
                            as: "variantImages",
                            required: false,
                        },
                    ],
                },
                {
                    model: ProductImage,
                    as: "images",
                    where: { variant_id: null },
                    required: false,
                },
            ],
            distinct: true,
            limit: Number(limit),
            offset: Number(offset),
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tìm kiếm sản phẩm",
            error: error.message,
        });
    }
};

// =============================
// 🏷️ Lấy sản phẩm theo brand (slug)
// =============================
exports.getProductsByBrand = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const brand = await Brand.findOne({
            where: { slug: req.params.slug, status: true },
        });


        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thương hiệu",
            });
        }

        const { rows: products, count } = await Product.findAndCountAll({
            where: {
                brand_id: brand.id,
                status: true,
            },
            include: [
                {
                    model: Brand,
                    as: "brand",
                    attributes: ["id", "name", "logo", "slug"],
                },
                {
                    model: Category,
                    as: "categories",
                    through: { attributes: [] },
                },
                {
                    model: ProductVariant,
                    as: "variants",
                    attributes: ["id", "price", "discount_price", "stock"],
                    include: [
                        {
                            model: ProductImage,
                            as: "variantImages",
                            required: false,
                        },
                    ],
                },
                {
                    model: ProductImage,
                    as: "images",
                    where: { variant_id: null },
                    required: false,
                },
            ],
            distinct: true,
            limit: Number(limit),
            offset: Number(offset),
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / limit),
            },
            brand,
        });
    } catch (error) {
        console.error("Error fetching products by brand:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy sản phẩm theo thương hiệu",
            error: error.message,
        });
    }
};

