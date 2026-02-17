const pool = require("../config/db");


exports.createCategory = async (category_name) => {
  const conn = await pool.getConnection();
  try {

    const result = await conn.query(
      `INSERT INTO categories (category_name)
       VALUES (?)`,
      [category_name]
    );

    return result;

  } finally {
    conn.release();
  }
};

exports.getAllCategories = async () => {
  const conn = await pool.getConnection();
  try {

    const rows = await conn.query(
      `SELECT * FROM categories
       ORDER BY category_id ASC`
    );

    return rows;

  } finally {
    conn.release();
  }
};


exports.getCategoryById = async (id) => {
  const conn = await pool.getConnection();
  try {

    const rows = await conn.query(
      `SELECT * FROM categories
       WHERE category_id = ?`,
      [id]
    );

    return rows[0] || null;

  } finally {
    conn.release();
  }
};


exports.updateCategory = async (id, category_name) => {
  const conn = await pool.getConnection();
  try {

    const result = await conn.query(
      `UPDATE categories
       SET category_name = ?
       WHERE category_id = ?`,
      [category_name, id]
    );

    return result;

  } finally {
    conn.release();
  }
};

exports.deleteCategory = async (id) => {
  const conn = await pool.getConnection();
  try {

    const result = await conn.query(
      `DELETE FROM categories
       WHERE category_id = ?`,
      [id]
    );

    return result;

  } finally {
    conn.release();
  }
};
