// middleware/auth.js

const { User } = require("../models")
const jwt = require("jsonwebtoken")
const SECRET = "supersecretkey"

function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" })
  }
  try {
    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    const user = await User.findByPk(decoded.id)
    if (!user) return res.status(401).json({ error: "User not found" })
    req.user = user
    next()
  } catch (err) {
    console.error("Token verification failed:", err)
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = authMiddleware
