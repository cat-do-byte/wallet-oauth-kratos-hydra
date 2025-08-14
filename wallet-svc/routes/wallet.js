const express = require("express")
const router = express.Router()
const walletController = require("../controllers/wallet")
const authenticate = require("../middleware/auth")

router.post("/create", authenticate, walletController.createWallet)
router.get("/balance", authenticate, walletController.getBalance)
router.post("/deposit", authenticate, walletController.deposit)
router.post("/withdraw", authenticate, walletController.withdraw)
router.post("/transfer", authenticate, walletController.transferMoney)

module.exports = router
