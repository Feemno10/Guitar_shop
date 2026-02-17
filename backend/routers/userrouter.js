const express = require("express");
const router = express.Router();

const userController = require("../controllers/userctrl");

const { verifyToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");



router.get("/me", verifyToken, userController.getMyProfile);

router.put("/update", verifyToken, userController.updateProfile);

router.put("/change-password", verifyToken, userController.changePassword);



router.get("/", verifyToken, isAdmin, userController.getAllUsers);

router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);


module.exports = router;
