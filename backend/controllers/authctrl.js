const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const JWT_SECRET = process.env.JWT_SECRET;


exports.register = async (req, res) => {
  try {
    const { email, password, confirm_password, first_name, last_name } = req.body;

    if (!email || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านไม่ตรงกัน",
      });
    }

    const exist = await User.findByEmail(email);
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Email นี้ถูกใช้งานแล้ว",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const userId = await User.createUser({
      email,
      password: hash,
      first_name,
      last_name,
      role: "user"
    });

    res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      user_id: userId
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "สมัครสมาชิกไม่สำเร็จ",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email หรือ Password ไม่ถูกต้อง",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Email หรือ Password ไม่ถูกต้อง",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "เข้าสู่ระบบไม่สำเร็จ",
    });
  }
};
