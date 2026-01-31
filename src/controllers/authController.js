const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu không khớp nhau!" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "customer", // mặc định role là user
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Nhập email hoặc mật khẩu" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (user.role !== "customer") {
      return res.status(403).json({ message: "Tài khoản không hợp lệ" });
    }

    if(user.isActive == 0){
      return res.status(403).json({ message: "Tài khoản đã bị khóa vui lòng liện hệ tới CSKH" });
    } 

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Nhập email hoặc mật khẩu" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được phép đăng nhập" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user được gắn vào từ middleware xác thực token
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone", "role", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    // Cập nhật các trường được cho phép
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    let where = {};

    if (search) {
      where = {
        ...where,
        name: { [Op.like]: `%${search}%` }
      };
    }

    if (role) {
      where.role = role; // admin, customer, seller...
    }

    const users = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role", "isActive", "createdAt"],
      where
    });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "phone", "role", "isActive", "createdAt"]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user!" });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.role = role ?? user.role;

    await user.save();

    res.json({ success: true, message: "Cập nhật thành công!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.role = role;
    await user.save();

    res.json({ success: true, message: "Đổi quyền thành công!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
