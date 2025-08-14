const { User, Wallet, sequelize, Transaction } = require("../models")

exports.createWallet = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ error: "User not found" })

    const [wallet, created] = await Wallet.findOrCreate({
      where: { userId },
      defaults: { balance: 100.0, userId },
    })

    if (!created) {
      return res.status(400).json({ message: "Wallet already exists" })
    }

    res.json({ message: "Wallet created", wallet })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id
    console.log("User ID:", userId)
    const wallet = await Wallet.findOne({ where: { userId } })
    // console.log("Wallet found:", wallet)
    if (!wallet) return res.status(404).json({ error: "Wallet not found" })

    res.json({ balance: wallet.balance })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.deposit = async (req, res) => {
  try {
    const { amount, description } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount required" })
    }

    const userId = req.user.id
    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) return res.status(404).json({ error: "Wallet not found" })

    const t = await sequelize.transaction()

    try {
      wallet.balance = parseFloat(wallet.balance) + parseFloat(amount)
      await wallet.save({ transaction: t })

      await Transaction.create(
        {
          walletId: wallet.id,
          amount,
          type: "deposit",
          description: description || "Deposit funds",
        },
        { transaction: t }
      )

      await t.commit()
    } catch (err) {
      await t.rollback()
      throw err
    }

    res.json({ message: "Deposit successful", balance: wallet.balance })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.withdraw = async (req, res) => {
  try {
    const { amount, description } = req.body
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount required" })
    }

    const userId = req.user.id
    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) return res.status(404).json({ error: "Wallet not found" })

    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" })
    }

    const t = await sequelize.transaction()

    try {
      wallet.balance = parseFloat(wallet.balance) - parseFloat(amount)
      await wallet.save({ transaction: t })

      await Transaction.create(
        {
          walletId: wallet.id,
          amount,
          type: "withdrawal",
          description: description || "Withdraw funds",
        },
        { transaction: t }
      )

      await t.commit()
    } catch (err) {
      await t.rollback()
      throw err
    }

    res.json({ message: "Withdrawal successful", balance: wallet.balance })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.transferMoney = async (req, res) => {
  try {
    const { toEmail, amount, description } = req.body
    const senderId = req.user.id

    if (!toEmail || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Recipient email and valid amount required" })
    }

    const senderWallet = await Wallet.findOne({ where: { userId: senderId } })
    if (!senderWallet)
      return res.status(404).json({ error: "Sender wallet not found" })

    const recipient = await User.findOne({ where: { email: toEmail } })
    if (!recipient)
      return res.status(404).json({ error: "Recipient not found" })

    const recipientWallet = await Wallet.findOne({
      where: { userId: recipient.id },
    })
    if (!recipientWallet)
      return res.status(404).json({ error: "Recipient wallet not found" })

    if (senderWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" })
    }

    const t = await sequelize.transaction()

    try {
      senderWallet.balance =
        parseFloat(senderWallet.balance) - parseFloat(amount)
      await senderWallet.save({ transaction: t })

      recipientWallet.balance =
        parseFloat(recipientWallet.balance) + parseFloat(amount)
      await recipientWallet.save({ transaction: t })

      await Transaction.create(
        {
          walletId: senderWallet.id,
          amount,
          type: "transfer",
          description: description || `Transfer to ${toEmail}`,
        },
        { transaction: t }
      )

      await Transaction.create(
        {
          walletId: recipientWallet.id,
          amount,
          type: "received",
          description: description || `Received from ${req.user.email}`,
        },
        { transaction: t }
      )

      await t.commit()
    } catch (err) {
      await t.rollback()
      throw err
    }

    res.json({
      message: "Transfer successful",
      balance: senderWallet.balance,
      success: true,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
