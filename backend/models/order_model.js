const pool = require("../config/db");


exports.createOrder = async (user_id) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();


    const cartItems = await conn.query(
      `SELECT 
          c.product_id,
          c.quantity,
          p.price,
          p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ?`,
      [user_id]
    );

    if (cartItems.length === 0) {
      throw new Error("Cart ว่าง");
    }

    
    for (let item of cartItems) {
      if (item.quantity > item.stock) {
        throw new Error("สินค้าใน stock ไม่พอ");
      }
    }

    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    const orderResult = await conn.query(
      `INSERT INTO orders (user_id, total_price)
       VALUES (?, ?)`,
      [user_id, total]
    );

    const order_id = orderResult.insertId;

  
    for (let item of cartItems) {

      await conn.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [
          order_id,
          item.product_id,
          item.quantity,
          item.price
        ]
      );


      await conn.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }


    await conn.query(
      `DELETE FROM cart WHERE user_id = ?`,
      [user_id]
    );

    await conn.commit();

    return order_id;

  } catch (error) {
    await conn.rollback();
    throw error;

  } finally {
    conn.release();
  }
};




exports.getOrdersByUser = async (user_id) => {
  const conn = await pool.getConnection();
  try {

    const rows = await conn.query(
      `SELECT * FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );

    return rows;

  } finally {
    conn.release();
  }
};



exports.getOrderDetail = async (order_id) => {
  const conn = await pool.getConnection();
  try {

    const items = await conn.query(
      `SELECT 
          oi.order_item_id,
          p.product_name,
          p.image_url,
          oi.quantity,
          oi.price,
          (oi.quantity * oi.price) AS total_price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [order_id]
    );

    return items;

  } finally {
    conn.release();
  }
};




exports.getAllOrders = async () => {
  const conn = await pool.getConnection();
  try {

    const rows = await conn.query(
      `SELECT 
          o.*,
          u.email
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       ORDER BY o.created_at DESC`
    );

    return rows;

  } finally {
    conn.release();
  }
};




exports.updateOrderStatus = async (order_id, status) => {
  const conn = await pool.getConnection();
  try {

    await conn.query(
      `UPDATE orders
       SET status = ?
       WHERE order_id = ?`,
      [status, order_id]
    );

  } finally {
    conn.release();
  }
};
