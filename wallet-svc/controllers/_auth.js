const jwt = require("jsonwebtoken")
const User = require("../models/index").User
const { JWT_SECRET } = process.env

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log(User)
    const user = await User.create({ email, password })
    res.status(201).json({ message: "User created", userId: user.id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const token = jwt.sign({ id: user.id, email: user.email }, "pikachu", {
      expiresIn: "1h",
    })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
