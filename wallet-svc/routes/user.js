const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth")
const userController = require("../controllers/user")
const authenticate = require("../middleware/auth")

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/users", userController.getAllUsers)

module.exports = router
