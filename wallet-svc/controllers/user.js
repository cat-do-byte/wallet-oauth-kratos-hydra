const { User, Wallet, Transaction } = require("../models")

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "createdAt"],
      include: {
        model: Wallet,
        attributes: ["balance"],
      },
    })
    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
