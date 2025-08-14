const express = require("express")
const router = express.Router()
const transactionController = require("../controllers/transaction")
const authenticate = require("../middleware/auth")

router.get("/", authenticate, transactionController.getTransactions)
router.get("/:id", authenticate, transactionController.getTransactionById)

module.exports = router
