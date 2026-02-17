const cartModel = require("../models/cart_model");



exports.addToCart = async (req, res) => {
  try {

    const user_id = req.user.user_id;
    const { product_id, quantity } = req.body;

    const qty = quantity || 1;

    const result = await cartModel.addToCart(user_id, product_id, qty);

    res.json(result);

  } catch (error) {
    console.log("ADD CART ERROR =", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getCart = async (req, res) => {
  try {

    console.log("USER FROM TOKEN =", req.user);

    const user_id = req.user.user_id;

    const cart = await cartModel.getCartByUser(user_id);

    console.log("CART FROM DB =", cart);

    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.updateQuantity = async (req, res) => {
  try {

    const cart_id = req.params.id;
    const { quantity } = req.body;

    await cartModel.updateCartQuantity(cart_id, quantity);

    res.json({ message: "อัปเดตแล้ว" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.removeItem = async (req, res) => {
  try {

    const cart_id = req.params.id;

    await cartModel.removeFromCart(cart_id);

    res.json({ message: "ลบแล้ว" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.clearCart = async (req, res) => {
  try {

    const user_id = req.user.user_id;

    await cartModel.clearCart(user_id);

    res.json({ message: "ล้างแล้ว" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
