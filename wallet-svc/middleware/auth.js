/* const jwt = require("jsonwebtoken")

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]
    if (!token) return res.status(401).json({ error: "Access denied" })

    const decoded = jwt.verify(token, "pikachu")
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" })
  }
}

module.exports = authenticate
 */

const axios = require("axios")
const { User } = require("../models")
const kratosPublic = "http://localhost:4433"

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const sessionCookie = req.cookies?.ory_kratos_session

  // Case 2: Third party OAuth access
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const access_token = authHeader.substring(7)

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

      const tokenInfo = response.data

      if (!tokenInfo.active) {
        return res.status(401).json({ error: "Invalid or expired token" })
      }

      const user = await User.findOne({ where: { hydraId: tokenInfo.sub } })
      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found in wallet service" })
      }

      console.log("user from token:", user)
      req.user = {
        id: user.id,
        // clientId: tokenInfo.client_id,
        // scopes: tokenInfo.scope ? tokenInfo.scope.split(" ") : [],
        // authType: "oauth",
      }

      return next()
    } catch (error) {
      return res.status(401).json({ error: "Token validation failed" })
    }
  }

  // Case 1: Direct user access via Kratos session
  // console.log("Session cookie:", sessionCookie)
  if (sessionCookie) {
    // Leave blank for now
    try {
      const response = await axios.get(
        "http://localhost:4433/sessions/whoami",
        {
          headers: {
            Cookie: `ory_kratos_session=${sessionCookie}`,
          },
        }
      )

      const session = response.data

      /*       req.user = {
        id: session.identity.id,
        email: session.identity.traits.email,
        name: session.identity.traits.name,
        authType: "direct",
      } */
      const user = await User.findOne({
        where: { hydraId: session.identity.id },
      })
      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found in wallet service" })
      }

      console.log("user from token:", user)
      req.user = {
        id: user.id,
      }

      return next()
    } catch (error) {
      console.error("Session validation failed:", error.response?.data)
      return res.status(401).json({ error: "Invalid or expired session" })
    }
  }

  return res.status(401).json({ error: "No valid authentication found" })
}

// const authenticate = async (req, res, next) => {
//   // const token = req.cookies["ory_kratos_session"]
//   const token = req.headers.cookie
//     ?.split(";")
//     .find((c) => c.trim().startsWith("ory_kratos_session="))
//     ?.split("=")[1]

//   // console.log("Token from cookie:", token)
//   if (!token) {
//     return res.status(401).json({ error: "Authentication required" })
//   }

//   try {
//     /*  const response = await axios.get(`${kratosPublic}/sessions/whoami`, {
//       headers: {
//         Cookie: `ory_kratos_session=${token}`,
//       },
//     }) */
//     const response = await axios.get(`${kratosPublic}/sessions/whoami`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })

//     const email = response.data.identity.traits.email
//     const user = await User.findOne({ where: { email } })
//     if (!user) {
//       return res.status(404).json({ error: "User not found in wallet service" })
//     }

//     // console.log("user from Kratos:", user)

//     // Attach local user id and email
//     req.user = {
//       id: user.id, // Local wallet DB user ID
//       email: user.email, // Email from DB
//       // identityId: identityId, // Kratos identity ID (optional)
//     }

//     // console.log("Session response:", response.data)
//     /*     req.user = {
//       id: response.data.identity.id,
//       email: response.data.identity.traits.email,
//       identity: response.data.identity,
//     } */

//     next()
//   } catch (error) {
//     console.error("Session validation failed:", error.response?.data)
//     return res.status(401).json({ error: "Invalid or expired session" })
//   }
// }

module.exports = authenticate
