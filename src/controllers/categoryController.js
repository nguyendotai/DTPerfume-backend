const Category = require("../models/Categories");

exports.getAllCategory = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({ success: false, error: "Slug không được để trống" });
        }

        const category = await Category.findOne({ where: { slug } });

        if (!category) {
            return res.status(404).json({ success: false, error: "Không tìm thấy danh mục" });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, error: "Tên danh mục là bắt buộc" });
        }

        const existing = await Category.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ success: false, error: "Danh mục này đã tồn tại" });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: Category.slugify(name),
            description: description?.trim() || null,
        });
        res.status(201).json({
            success: true,
            data: category,
            message: "Tạo danh mục thành công",
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const { name, description } = req.body;

        if (!slug) {
            return res.status(400).json({ success: false, error: "Slug không được để trống" });
        }

        // Tìm category theo slug
        const category = await Category.findOne({ where: { slug } });
        if (!category) {
            return res.status(404).json({ success: false, error: "Không tìm thấy danh mục" });
        }

        // Nếu muốn update name, tạo slug mới
        if (name && name.trim() !== "") {
            category.name = name.trim();
            category.slug = Category.slugify(name);
        }
        if (description !== undefined) category.description = description.trim();

        await category.save();

        res.status(200).json({
            success: true,
            data: category,
            message: "Cập nhật danh mục thành công",
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ success: false, error: "Slug không được để trống" });
        }

        const category = await Category.findOne({ where: { slug } });
        if (!category) {
            return res.status(404).json({ success: false, error: "Không tìm thấy danh mục" });
        }

        if (category.getProducts) {
            const products = await category.getProducts();
            if (products.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: "Danh mục này đang được dùng cho Sản phẩm, không thể xoá",
                });
            }
        }

        await category.destroy();
        res.json({ success: true, message: "Xóa danh mục thành công" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}