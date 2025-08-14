const express = require("express")
const cors = require("cors")
const { sequelize } = require("./models")

const app = express()
app.use(cors())
app.use(express.json())

app.use(express.static("public"))

const userRoutes = require("./routes/user")
const clientRoutes = require("./routes/client")

app.use("/api/users", userRoutes)
app.use("/api/clients", clientRoutes)

const PORT = 3002

async function startServer() {
  try {
    await sequelize.sync({ alter: true })
    app.listen(PORT, () => {
      console.log(`OAuth Management Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
  }
}

startServer()
