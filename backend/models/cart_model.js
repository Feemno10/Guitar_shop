const db = require("../config/db");



async function addToCart(user_id, product_id, quantity) {

  const rows = await db.query(
    "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
    [user_id, product_id]
  );

  if (rows.length > 0) {

    await db.query(
      "UPDATE cart SET quantity = quantity + ? WHERE cart_id = ?",
      [quantity, rows[0].cart_id]
    );

    return { message: "เพิ่มจำนวนสินค้าแล้ว" };
  }

  await db.query(
    "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
    [user_id, product_id, quantity]
  );

  return { message: "เพิ่มสินค้าแล้ว" };
}


async function getCartByUser(user_id) {

  const rows = await db.query(`
    SELECT 
      c.cart_id,
      c.quantity,
      p.product_id,
      p.product_name,
      CAST(p.price AS DECIMAL(10,2)) AS price,
      p.image_url,
      (c.quantity * CAST(p.price AS DECIMAL(10,2))) AS total_price
    FROM cart c
    JOIN products p
      ON c.product_id = p.product_id
    WHERE c.user_id = ?
  `, [user_id]);

  return rows;
}


async function updateCartQuantity(cart_id, quantity) {

  quantity = parseInt(quantity) || 1;

  await db.query(
    "UPDATE cart SET quantity = ? WHERE cart_id = ?",
    [quantity, cart_id]
  );
}


async function removeFromCart(cart_id) {

  await db.query(
    "DELETE FROM cart WHERE cart_id = ?",
    [cart_id]
  );
}


async function clearCart(user_id) {

  await db.query(
    "DELETE FROM cart WHERE user_id = ?",
    [user_id]
  );
}



module.exports = {
  addToCart,
  getCartByUser,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
