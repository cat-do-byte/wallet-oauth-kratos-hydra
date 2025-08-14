const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const axios = require("axios")
const { sequelize, User, Order } = require("./models")
const path = require("path")
const authMiddleware = require("./middleware/auth")

const app = express()
const PORT = 3050

app.use(cors())
app.use(express.json())
app.use(express.static("public"))
// product list
/* const products = [
  { id: 1, name: "Apple iPhone 15 Pro", price: 999 },
  { id: 2, name: "Samsung Galaxy S24", price: 899 },
  { id: 3, name: "Sony WH-1000XM5 Headphones", price: 399 },
  { id: 4, name: "Apple MacBook Air M3", price: 1299 },
  { id: 5, name: "Nintendo Switch OLED", price: 349 },
] */

const products = [
  { id: 1, name: "Apple iPhone 15 Pro", price: 950 },
  { id: 2, name: "Samsung Galaxy S24", price: 880 },
  { id: 3, name: "Sony WH-1000XM5 Headphones", price: 400 },
  { id: 4, name: "Apple MacBook Air M3", price: 1300 },
  { id: 5, name: "Nintendo Switch OLED", price: 80 },
  { id: 6, name: "Logitech MX Master 3S Mouse", price: 6 },
  { id: 7, name: "Razer Gaming Mouse Pad", price: 40 },
  { id: 8, name: "USB-C to HDMI Adapter", price: 20 },
]

const clientId = "pikachu"
const clientSecret = "super123"
const SECRET = "supersecretkey"

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1h",
  })
}

function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

app.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ where: { email } })
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" })
  }
  const token = generateToken(user)
  res.json({ token })
})

app.post("/register", async (req, res) => {
  const { email, password } = req.body
  const user = await User.create({ email, password })
  res.json(user)
})

/* app.get("/callback", async (req, res) => {
  const { code } = req.query

  if (!code) {
    return res.status(400).send("Missing authorization code")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  )

  try {
    const tokenResponse = await axios.post(
      "http://localhost:4444/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3050/callback",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
      }
    )

    res.json({ tokens: tokenResponse.data })
  } catch (error) {
    console.error(
      "Token exchange failed:",
      error.response?.data || error.message
    )
    res.status(500).json({ error: "Token exchange failed" })
  }
}) */

app.get("/callback", async (req, res) => {
  const { code, state } = req.query

  if (!code || !state) {
    return res.status(400).send("Missing authorization code or state")
  }

  let user
  try {
    const decoded = verifyToken(state) // state is JWT from localStorage
    user = await User.findByPk(decoded.id)
    if (!user) return res.status(404).send("User not found")
  } catch (err) {
    return res.status(401).send("Invalid state token")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  )

  try {
    const tokenResponse = await axios.post(
      "http://localhost:4444/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3050/callback",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
      }
    )

    // save access token to that user's record
    user.accessToken = tokenResponse.data.access_token
    await user.save()

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Wallet Connected</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex items-center justify-center h-screen">
        <div class="bg-white p-8 rounded shadow text-center">
          <h1 class="text-2xl font-bold mb-4">Wallet Connected Successfully!</h1>
          <a href="/menu" class="bg-blue-500 text-white px-4 py-2 rounded">Go to Products</a>
        </div>
      </body>
      </html>
    `)
  } catch (error) {
    console.error(
      "Token exchange failed:",
      error.response?.data || error.message
    )
    res.status(500).json({ error: "Token exchange failed" })
  }
})

app.get("/introspect", async (req, res) => {
  const access_token =
    "ory_at_5S-wp7e9MiAu8_jl6kYR25XkwrKCR5PuAcpEyEy2x0E._5LciWWOgx-I6cxzlTSg7ZM-4VxnHJgmU3eVxjeidkg"

  if (!access_token) {
    return res.status(400).json({ error: "Missing access_token" })
  }

  try {
    const response = await axios.post(
      "http://localhost:4445/oauth2/introspect",
      new URLSearchParams({ token: access_token }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    res.json(response.data)
  } catch (error) {
    console.error(
      "Introspection failed:",
      error.response?.data || error.message
    )
    res.status(500).json({ error: "Token introspection failed" })
  }
})

app.get("/balance", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/wallet/balance",
      {
        headers: {
          authorization:
            "Bearer ory_at_BY-pAS_usQaVJwmKSk4kGR4DWXerU7DBs1ptyPGZQb4.7xxHzLOmx6OXg6wBLE1g9HPtz5VnzO30Sdm9FnSOToY",
        },
      }
    )
    console.log(response.data)
    res.json(response.data)
  } catch (err) {
    console.error(err.response?.data || err.message)
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message })
  }
})

app.get("/products", (req, res) => {
  res.json({ products })
})

app.post("/buy/:id", authMiddleware, async (req, res) => {
  const product = products.find((p) => p.id == req.params.id)
  if (!product) return res.status(404).json({ error: "Product not found" })

  try {
    // get stored OAuth access token from DB
    const user = await User.findByPk(req.user.id)
    const accessToken = user?.accessToken
    if (!accessToken) {
      return res.status(400).json({ error: "No linked wallet access token" })
    }

    const payload = {
      toEmail: "merchant1@gmail.com",
      amount: product.price,
      description: `Purchase of ${product.name}`,
    }

    // console.log("payload:", payload)
    const payRes = await axios.post(
      "http://localhost:3000/api/wallet/transfer",
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    console.log("Payment response:", payRes.data)
    if (payRes.data.success) {
      const order = await Order.create({
        productName: product.name,
        price: product.price,
        status: "paid",
        userId: req.user.id,
      })
      return res.json(order)
    } else {
      return res.status(400).json({ error: "Payment failed" })
    }
  } catch (err) {
    console.error("Payment error:", err.response?.data || err.message)
    return res.status(500).json({ error: "Wallet service error" })
  }
})

/* app.listen(PORT, () => {
  console.log(`E-Commerce Service running on http://localhost:${PORT}`)
})
 */
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views/register.html"))
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"))
})

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "views/products.html"))
})
app.get("/connect-wallet", (req, res) => {
  res.sendFile(path.join(__dirname, "views/connect-wallet.html"))
})

async function startServer() {
  try {
    await sequelize.sync()
    app.listen(PORT, () => {
      console.log(`Server Shop running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
  }
}

startServer()
