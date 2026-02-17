const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartctrl");
const { verifyToken } = require("../middleware/auth");

router.post("/", verifyToken, cartController.addToCart);
router.get("/", verifyToken, cartController.getCart);
router.put("/:id", verifyToken, cartController.updateQuantity);
router.delete("/:id", verifyToken, cartController.removeItem);
router.delete("/", verifyToken, cartController.clearCart);

module.exports = router;
