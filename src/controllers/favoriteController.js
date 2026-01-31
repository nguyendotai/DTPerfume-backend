const FavoriteList = require("../models/FavoritesList");
const FavoriteItem = require("../models/FavoriteItems");
const ProductVariant = require("../models/ProductVariants");
const Product = require("../models/Products");
const ProductImage = require("../models/ProductImages");
const Brand = require("../models/Brands");

exports.addToFavorite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { variant_id } = req.body;

    if (!variant_id)
      return res.status(400).json({ message: "Thiếu variant_id" });

    let favoriteList = await FavoriteList.findOne({ where: { user_id } });
    if (!favoriteList) {
      favoriteList = await FavoriteList.create({ user_id });
    }

    const exist = await FavoriteItem.findOne({
      where: { favorite_id: favoriteList.id, variant_id }
    });

    if (exist) {
      return res.status(200).json({ message: "Sản phẩm đã có trong yêu thích" });
    }

    const item = await FavoriteItem.create({
      favorite_id: favoriteList.id,
      variant_id,
      quantity: 1
    });

    return res.json({ message: "Đã thêm vào danh sách yêu thích", item });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server lỗi" });
  }
};


exports.removeItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    const item = await FavoriteItem.findByPk(item_id);
    if (!item)
      return res.status(404).json({ message: "Không tìm thấy item" });

    await item.destroy();

    return res.json({ message: "Đã xóa item" });
  } catch (err) {
    return res.status(500).json({ message: "Server lỗi" });
  }
};

exports.getFavorite = async (req, res) => {
  const user_id = req.user.id;

  const favorite = await FavoriteList.findOne({
    where: { user_id },
    include: [
      {
        model: FavoriteItem,
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
    items: favorite ? favorite.items : []
  });
};


exports.syncFavorite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { items } = req.body;

    let favorite = await FavoriteList.findOne({ where: { user_id } });
    if (!favorite) {
      favorite = await FavoriteList.create({ user_id });
    }

    const dbItems = await FavoriteItem.findAll({
      where: { favorite_id: favorite.id }
    });

    const mapDB = new Map();
    dbItems.forEach(item => mapDB.set(item.variant_id, item));

    for (const item of items) {
      if (!mapDB.has(item.variant_id)) {
        await FavoriteItem.create({
          favorite_id: favorite.id,
          variant_id: item.variant_id,
          quantity: 1
        });
      }
    }

    return res.json({ message: "Đã sync danh sách yêu thích" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server lỗi" });
  }
};

