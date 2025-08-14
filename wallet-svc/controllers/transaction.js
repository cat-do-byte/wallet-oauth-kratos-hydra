const { Transaction, Wallet, sequelize } = require("../models")

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id
    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) return res.status(404).json({ error: "Wallet not found" })

    const transactions = await Transaction.findAll({
      where: { walletId: wallet.id },
      attributes: ["id", "amount", "type", "description", "createdAt"],
      order: [["createdAt", "DESC"]],
    })

    res.json({ transactions })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) return res.status(404).json({ error: "Wallet not found" })

    const transaction = await Transaction.findOne({
      where: { id, walletId: wallet.id },
      attributes: ["id", "amount", "type", "description", "createdAt"],
    })

    if (!transaction)
      return res.status(404).json({ error: "Transaction not found" })

    res.json({ transaction })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
