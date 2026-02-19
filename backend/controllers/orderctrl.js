const Order = require("../models/order_model");

exports.checkout = async (req, res) => {
  try {
    // รองรับ User ID จาก Token
    const user_id = req.user?.user_id || req.user?.id;
    
    if (!user_id) {
        return res.status(400).json({ message: "ไม่พบข้อมูล User กรุณา Login ใหม่" });
    }

    const order_id = await Order.createOrder(user_id);

    res.status(201).json({
      message: "สั่งซื้อสำเร็จ",
      order_id
    });

  } catch (error) {
    console.error("Checkout Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;
    const orders = await Order.getOrdersByUser(user_id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order_id = req.params.id;

    if (!order_id || order_id === 'undefined') {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const detail = await Order.getOrderDetail(order_id);

    // ถ้าไม่เจอออเดอร์ให้เตือน
    if (!detail.order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(detail); // ส่งกลับไปเป็น { order: {...}, items: [...] }
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

    const allowStatus = ["pending", "paid", "shipped", "completed", "cancelled"];

    if (!allowStatus.includes(status)) {
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    await Order.updateOrderStatus(order_id, status);

    res.json({ message: "อัปเดตสถานะเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};