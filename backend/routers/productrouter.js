const express = require("express");
const router = express.Router();

const productController = require("../controllers/productctrl");
const upload = require("../middleware/upload");

router.post("/", upload.single("image"), productController.createProduct);


router.put(
  "/:id",
  upload.single("image"), 
  productController.updateProduct,
);


router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);


router.delete("/:id", productController.deleteProduct);

module.exports = router;
