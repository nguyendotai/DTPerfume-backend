const Brand = require("../models/Brands");
const cloudinary = require("../config/cloudinary");

// ================= CREATE =================
exports.createBrand = async (req, res) => {
    try {
        const { name, slug, description, status } = req.body;

        const existed = await Brand.findOne({ where: { slug } });
        if (existed) {
            return res.status(400).json({ message: "Brand đã tồn tại" });
        }

        let logoUrl = null;
        let bannerUrl = null;

        if (req.files?.logo) {
            const uploaded = await cloudinary.uploader.upload(
                req.files.logo[0].path,
                { folder: "dtperfume/brands/logo" }
            );
            logoUrl = uploaded.secure_url;
        }

        if (req.files?.banner) {
            const uploaded = await cloudinary.uploader.upload(
                req.files.banner[0].path,
                { folder: "dtperfume/brands/banner" }
            );
            bannerUrl = uploaded.secure_url;
        }

        const brand = await Brand.create({
            name,
            slug,
            description,
            status: status === "true" || status === true,
            logo: logoUrl,
            banner: bannerUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Tạo brand thành công",
            brand,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// ================= GET ALL =================
exports.getAllBrands = async (req, res) => {
    try {
        const data = await Brand.findAll({
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// ================= GET BY ID =================
exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findByPk(req.params.id);

        if (!brand) {
            return res.status(404).json({ message: "Không tìm thấy brand" });
        }

        return res.status(200).json({
            success: true,
            brand,
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// ================= UPDATE =================
exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, status } = req.body;

        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ message: "Brand không tồn tại" });
        }

        let logoUrl = brand.logo;
        let bannerUrl = brand.banner;

        // UPDATE LOGO
        if (req.files?.logo) {
            if (brand.logo) {
                const cloudId = brand.logo.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`dtperfume/brands/logo/${cloudId}`);
            }

            const uploaded = await cloudinary.uploader.upload(
                req.files.logo[0].path,
                { folder: "dtperfume/brands/logo" }
            );

            logoUrl = uploaded.secure_url;
        }

        // UPDATE BANNER
        if (req.files?.banner) {
            if (brand.banner) {
                const cloudId = brand.banner.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`dtperfume/brands/banner/${cloudId}`);
            }

            const uploaded = await cloudinary.uploader.upload(
                req.files.banner[0].path,
                { folder: "dtperfume/brands/banner" }
            );

            bannerUrl = uploaded.secure_url;
        }

        await brand.update({
            name,
            slug,
            description,
            status: status === "true" || status === true,
            logo: logoUrl,
            banner: bannerUrl,
        });

        return res.status(200).json({
            success: true,
            message: "Cập nhật brand thành công",
            brand,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

// ================= DELETE =================
exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findByPk(id);
        if (!brand) {
            return res.status(404).json({ message: "Brand không tồn tại" });
        }

        if (brand.logo) {
            const cloudId = brand.logo.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`dtperfume/brands/logo/${cloudId}`);
        }

        if (brand.banner) {
            const cloudId = brand.banner.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`dtperfume/brands/banner/${cloudId}`);
        }

        await brand.destroy();

        return res.status(200).json({
            success: true,
            message: "Xóa brand thành công",
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};
// ================= GET BY SLUG =================
exports.getBrandBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const brand = await Brand.findOne({
            where: { slug, status: true },
        });

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy brand",
            });
        }

        return res.status(200).json({
            success: true,
            data: brand,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};// ================= GET BY SLUG (ADMIN) =================
exports.getBrandBySlugAdmin = async (req, res) => {
    try {
        const { slug } = req.params;

        const brand = await Brand.findOne({ where: { slug } });
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy brand",
            });
        }

        return res.status(200).json({
            success: true,
            data: brand,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server",
        });
    }
};

