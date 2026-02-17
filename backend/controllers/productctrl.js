const Product = require("../models/product_model");


exports.createProduct = async (req, res) => {
  try {

    let {
      product_name,
      description,
      price,
      stock,
      category_id
    } = req.body;


    price = Number(price);
    stock = Number(stock);
    category_id = Number(category_id);

    if (!product_name || isNaN(price)) {
      return res.status(400).json({
        message: "ข้อมูลไม่ถูกต้อง"
      });
    }

    if (isNaN(stock)) stock = 0;

    let image_url = null;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const product = {
      product_name,
      description: description || null,
      price,
      stock,
      category_id,
      image_url
    };

    const result = await Product.createProduct(product);

    res.status(201).json({
      message: "เพิ่มสินค้าเรียบร้อย",
      product_id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(products);

  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "ไม่พบสินค้า"
      });
    }

    res.json(product);

  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {

    const id = req.params.id;

    let {
      product_name,
      description,
      price,
      stock,
      category_id
    } = req.body;

    price = Number(price);
    stock = Number(stock);
    category_id = Number(category_id);

    if (isNaN(stock)) stock = 0;

    let image_url = req.body.image_url || null;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const product = {
      product_name,
      description,
      price,
      stock,
      category_id,
      image_url
    };

    await Product.updateProduct(id, product);

    res.json({
      message: "อัปเดตสินค้าเรียบร้อย"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    await Product.deleteProduct(id);

    res.json({
      message: "ลบสินค้าเรียบร้อย"
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
