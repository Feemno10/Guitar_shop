const Category = require("../models/category_model");


exports.createCategory = async (req, res) => {
  try {

    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({
        message: "กรุณากรอกชื่อหมวดหมู่"
      });
    }

    const result = await Category.createCategory(category_name);

    res.status(201).json({
      message: "เพิ่มหมวดหมู่สำเร็จ",
      category_id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllCategories = async (req, res) => {
  try {

    const categories = await Category.getAllCategories();

    res.json(categories);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCategoryById = async (req, res) => {
  try {

    const id = req.params.id;

    const category = await Category.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        message: "ไม่พบหมวดหมู่"
      });
    }

    res.json(category);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.updateCategory = async (req, res) => {
  try {

    const id = req.params.id;
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({
        message: "กรุณากรอกชื่อหมวดหมู่"
      });
    }

    await Category.updateCategory(id, category_name);

    res.json({
      message: "อัปเดตหมวดหมู่สำเร็จ"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteCategory = async (req, res) => {
  try {

    const id = req.params.id;

    await Category.deleteCategory(id);

    res.json({
      message: "ลบหมวดหมู่สำเร็จ"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
