const db = require("../config/db");

exports.createProduct = async (product) => {
  const conn = await db.getConnection();

  try {
    const sql = `
      INSERT INTO products
      (product_name, description, price, stock, category_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await conn.query(sql, [
      product.product_name,
      product.description,
      product.price,
      product.stock,
      product.category_id,
      product.image_url
    ]);

    return result;

  } finally {
    conn.release();
  }
};

// GET ALL
exports.getAllProducts = async () => {
  const conn = await db.getConnection();

  try {
    const sql = `
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c
      ON p.category_id = c.category_id
      ORDER BY p.created_at ASC
    `;

    const rows = await conn.query(sql);
    return rows;

  } finally {
    conn.release();
  }
};

// GET BY ID
exports.getProductById = async (id) => {
  const conn = await db.getConnection();

  try {
    const sql = `
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c
      ON p.category_id = c.category_id
      WHERE p.product_id = ?
    `;

    const rows = await conn.query(sql, [id]);
    return rows[0];

  } finally {
    conn.release();
  }
};

// UPDATE
exports.updateProduct = async (id, product) => {
  const conn = await db.getConnection();

  try {
    const sql = `
      UPDATE products
      SET product_name = ?,
          description = ?,
          price = ?,
          stock = ?,
          category_id = ?,
          image_url = ?
      WHERE product_id = ?
    `;

    const result = await conn.query(sql, [
      product.product_name,
      product.description,
      product.price,
      product.stock,
      product.category_id,
      product.image_url,
      id
    ]);

    return result;

  } finally {
    conn.release();
  }
};

exports.deleteProduct = async (id) => {

  // ลบ cart ที่ใช้สินค้านี้ก่อน
  await db.query(
    "DELETE FROM cart WHERE product_id = ?",
    [id]
  );

  // แล้วค่อยลบสินค้า
  await db.query(
    "DELETE FROM products WHERE product_id = ?",
    [id]
  );
};
