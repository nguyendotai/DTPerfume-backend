const Category = require("../models/Categories");

exports.getCategories = async (req, res) => {
  try {
    const { isMain } = req.query;

    const where = { isActive: true };

    if (isMain !== undefined) {
      where.isMain = isMain === "true";
    }

    const categories = await Category.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, isActive: true },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy danh mục",
      });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, isActive, isMain } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Tên danh mục là bắt buộc",
      });
    }

    const exists = await Category.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: "Danh mục này đã tồn tại",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: Category.slugify(name),
      description: description?.trim() || null,
      isActive: isActive === "false" ? false : true,
      isMain: isMain === "true",
      image: req.file?.path || null,
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
    const { name, description, isActive, isMain } = req.body;

    const category = await Category.findOne({ where: { slug } });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy danh mục",
      });
    }

    if (name?.trim()) {
      category.name = name.trim();
      category.slug = Category.slugify(name);
    }

    if (description !== undefined) {
      category.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      category.isActive = isActive === "true";
    }

    if (isMain !== undefined) {
      category.isMain = isMain === "true";
    }

    if (req.file) {
      category.image = req.file.path;
    }

    await category.save();

    res.json({
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

    const category = await Category.findOne({ where: { slug } });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy danh mục",
      });
    }

    if (category.getProducts) {
      const products = await category.getProducts();
      if (products.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Danh mục đang được sử dụng, không thể xoá",
        });
      }
    }

    await category.destroy();

    res.json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
