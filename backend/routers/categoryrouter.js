const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryctrl");

const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");


router.get("/", categoryController.getAllCategories);


router.get("/:id", categoryController.getCategoryById);


router.post("/", verifyToken, isAdmin, categoryController.createCategory);

router.put("/:id", verifyToken, isAdmin, categoryController.updateCategory);

router.delete("/:id", verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
