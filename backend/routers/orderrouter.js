const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderctrl");

const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");



router.use(verifyToken);



router.post("/checkout", orderController.checkout);



router.get("/my-orders", orderController.getMyOrders);



router.get("/:id", orderController.getOrderDetail);



router.get("/", isAdmin, orderController.getAllOrders);



router.put("/:id/status", isAdmin, orderController.updateStatus);


module.exports = router;
