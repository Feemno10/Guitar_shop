const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {   

  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
    return res.status(401).json({ message: "ไม่มีสิทธิเข้าถึง" });
  }

  const token = authHeaders.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};
