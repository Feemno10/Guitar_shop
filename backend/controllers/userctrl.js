const userModel = require("../models/user_model");
const bcrypt = require("bcrypt");


exports.getMyProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.user_id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;

    await userModel.updateProfile(req.user.user_id, {
      first_name,
      last_name
    });

    res.json({ message: "Profile updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const user = await userModel.findById(req.user.user_id);

    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await userModel.updatePassword(req.user.user_id, hashed);

    res.json({ message: "Password changed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
