const pool = require("../config/db");

// 1. สร้างออเดอร์ (Checkout)
exports.createOrder = async (user_id) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ดึงข้อมูลสินค้าจากตะกร้า (เอา [ ] ออกแล้ว)
    const cartItems = await conn.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ?`,
      [user_id]
    );

    // เช็คว่าตะกร้าว่างหรือไม่
    if (!cartItems || cartItems.length === 0) {
      throw new Error("ไม่มีสินค้าในตะกร้า หรือ Cart ว่าง");
    }

    let total = 0;
    // คำนวณยอดรวมและเช็คสต็อก
    for (let item of cartItems) {
      if (item.quantity > item.stock) {
        throw new Error(`สินค้ารหัส ${item.product_id} มีไม่พอในสต็อก`);
      }
      total += item.price * item.quantity;
    }

    // บันทึกข้อมูลลงตาราง orders (เพิ่ม status เป็น pending ให้เลย)
    const orderResult = await conn.query(
      `INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, 'pending')`,
      [user_id, total]
    );

    const order_id = orderResult.insertId;

    // บันทึกข้อมูลลงตาราง order_items (ตารางลูก) และตัดสต็อก
    for (let item of cartItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [order_id, item.product_id, item.quantity, item.price]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // ลบสินค้าในตะกร้าทิ้งหลังสั่งซื้อเสร็จ
    await conn.query(`DELETE FROM cart WHERE user_id = ?`, [user_id]);
    
    await conn.commit();
    return order_id;

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// 2. ดึงออเดอร์ทั้งหมดของ User (หน้า My Orders)
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

// 3. ดึงรายละเอียดออเดอร์ (ใช้ในหน้า Order Detail และ PDF)
exports.getOrderDetail = async (order_id) => {
  const conn = await pool.getConnection();
  try {
    const orderRows = await conn.query(
      `SELECT * FROM orders WHERE order_id = ?`,
      [order_id]
    );

    const itemRows = await conn.query(
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

    // ✅ ส่งกลับไปเป็น Object ที่มีทั้ง order และ items
    return {
      order: orderRows.length > 0 ? orderRows[0] : null,
      items: itemRows 
    };

  } finally {
    conn.release();
  }
};

// 4. ดึงออเดอร์ทั้งหมดในระบบ (สำหรับ Admin)
exports.getAllOrders = async () => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT o.*, u.email 
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       ORDER BY o.created_at DESC`
    );
    return rows;
  } finally {
    conn.release();
  }
};

// 5. อัปเดตสถานะออเดอร์ (สำหรับ Admin)
exports.updateOrderStatus = async (order_id, status) => {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [status, order_id]
    );
  } finally {
    conn.release();
  }
};