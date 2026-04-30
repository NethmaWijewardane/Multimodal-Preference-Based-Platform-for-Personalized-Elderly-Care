import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};