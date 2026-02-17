const Order = require("../models/order_model");



exports.checkout = async (req, res) => {
  try {

     console.log("USER FROM TOKEN =", req.user)
    const user_id = req.user.user_id;

    const order_id = await Order.createOrder(user_id);

    res.status(201).json({
      message: "สั่งซื้อสำเร็จ",
      order_id
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};




exports.getMyOrders = async (req, res) => {
  try {

    const user_id = req.user.id;

    const orders = await Order.getOrdersByUser(user_id);

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.getOrderDetail = async (req, res) => {
  try {

    const order_id = req.params.id;

    const detail = await Order.getOrderDetail(order_id);

    res.json(detail);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.getAllOrders = async (req, res) => {
  try {

    const orders = await Order.getAllOrders();

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.updateStatus = async (req, res) => {
  try {

    const order_id = req.params.id;
    const { status } = req.body;

    const allowStatus = [
      "pending",
      "paid",
      "shipped",
      "completed",
      "cancelled"
    ];

    if (!allowStatus.includes(status)) {
      return res.status(400).json({
        message: "สถานะไม่ถูกต้อง"
      });
    }

    await Order.updateOrderStatus(order_id, status);

    res.json({
      message: "อัปเดตสถานะเรียบร้อย"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
