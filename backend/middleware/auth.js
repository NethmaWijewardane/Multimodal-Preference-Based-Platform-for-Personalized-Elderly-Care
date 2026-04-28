import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2. Extract token (Bearer <token>)
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user correctly
    req.user = decoded; 
    // decoded = { id, role, iat, exp }

    next();

  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err.message);

    return res.status(401).json({ message: "Unauthorized access" });
  }
};