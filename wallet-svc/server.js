const express = require("express")
const cookieParser = require("cookie-parser")
const { sequelize } = require("./models")
const cors = require("cors")

const app = express()

app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const userRoutes = require("./routes/user")
const walletRoutes = require("./routes/wallet")
const transactionRoutes = require("./routes/transaction")

app.use("/api/users", userRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/transactions", transactionRoutes)

const PORT = 3000

async function startServer() {
  try {
    await sequelize.sync()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
  }
}

startServer()
