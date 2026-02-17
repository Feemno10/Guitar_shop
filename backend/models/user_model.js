const pool = require("../config/db");


async function findByEmail(email) {
  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return rows[0] || null;
  } finally {
    if (conn) conn.release();
  }
}


async function findById(user_id) {
  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id]
    );

    return rows[0] || null;
  } finally {
    if (conn) conn.release();
  }
}

async function createUser(data) {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `INSERT INTO users
      (email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)`,
      [
        data.email,
        data.password,
        data.first_name || null,
        data.last_name || null,
        data.role || "user"
      ]
    );

    return result.insertId;
  } finally {
    if (conn) conn.release();
  }
}


async function updateProfile(user_id, data) {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(
      `UPDATE users
       SET first_name = ?, last_name = ?
       WHERE user_id = ?`,
      [
        data.first_name,
        data.last_name,
        user_id
      ]
    );
  } finally {
    if (conn) conn.release();
  }
}

async function updatePassword(user_id, password) {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [password, user_id]
    );
  } finally {
    if (conn) conn.release();
  }
}


async function updateRole(user_id, role) {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(
      "UPDATE users SET role = ? WHERE user_id = ?",
      [role, user_id]
    );
  } finally {
    if (conn) conn.release();
  }
}


async function listUsers() {
  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query(`
      SELECT
        user_id,
        email,
        first_name,
        last_name,
        role,
        created_at
      FROM users
      ORDER BY user_id ASC
    `);

    return rows;
  } finally {
    if (conn) conn.release();
  }
}


async function deleteUser(user_id) {
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(
      "DELETE FROM users WHERE user_id = ?",
      [user_id]
    );
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  updatePassword,
  updateRole,
  listUsers,
  deleteUser
};
