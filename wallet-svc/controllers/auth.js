const axios = require("axios")
const { User } = require("../models")
kratosPublic = "http://localhost:4433"

exports.register = async (req, res) => {
  try {
    // Step 1: Get registration flow
    const flowRes = await axios.get(
      `${kratosPublic}/self-service/registration/api`,
      {
        withCredentials: true,
      }
    )

    const flow = flowRes.data

    // Step 2: Submit registration data to Kratos
    const payload = {
      method: "password",
      password: req.body.password,
      traits: {
        email: req.body.email,
        name: req.body.email || "",
      },
    }

    const submitRes = await axios.post(
      `${kratosPublic}/self-service/registration?flow=${flow.id}`,
      payload,
      { withCredentials: true }
    )

    console.log("Registration response:", submitRes.data)

    const newUser = await User.create({
      //   id: submitRes.data.session.identity.id,
      email: req.body.email,
      hydraId: submitRes.data.session.identity.id,
      password: "xxx", // Store password securely in production
      // add other fields if needed
    })

    console.log("New user created:", newUser)

    return res.json({
      success: true,
      message: "Registration successful",
    })
  } catch (error) {
    console.error("Error during registration:", error)
    console.error("Registration failed:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "Registration failed",
      details: error.response?.data,
    })
  }
}

exports.login = async (req, res) => {
  try {
    // Step 1: Get login flow
    const flowRes = await axios.get(`${kratosPublic}/self-service/login/api`, {
      withCredentials: true,
    })

    const flow = flowRes.data

    // Step 2: Submit login data
    const payload = {
      method: "password",
      password: req.body.password,
      password_identifier: req.body.email,
    }

    const submitRes = await axios.post(
      `${kratosPublic}/self-service/login?flow=${flow.id}`,
      payload,
      { withCredentials: true }
    )

    // Step 3: Extract session token
    const { session_token, session } = submitRes.data

    // Step 4: Proxy Kratos session token to client
    res.cookie("ory_kratos_session", session_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    })

    return res.json({
      message: "Login successful",
      session_token,
      user: {
        id: session.identity.id,
        email: session.identity.traits.email,
      },
    })
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "Login failed",
      details: error.response?.data,
    })
  }
}
