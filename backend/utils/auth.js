const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const JWT_SECRET = process.env.JWT_SECRET || "zynk_secret_key_2024"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid token")
  }
}

const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authMiddleware,
}
