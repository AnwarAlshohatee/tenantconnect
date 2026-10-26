const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Display registration form.
exports.showRegister = (req, res) => {
  res.render("register", { error: null });
};

// Register a new tenant.
exports.register = async (req, res) => {
  try {
    const { name, email, password, building } = req.body;

    // Validate required fields.
    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !building?.trim()
    ) {
      return res.status(400).render("register", {
        error: "All fields are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).render("register", {
        error: "Password must be at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the email is already registered.
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).render("register", {
        error: "An account with this email already exists."
      });
    }

    // Hash the password before saving.
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      building: building.trim().toLowerCase()
    });

    // Regenerate the session ID after registration.
    req.session.regenerate((error) => {
      if (error) return res.status(500).send("Session error.");

      // Save only the user ID in the session.
      req.session.userId = user._id.toString();

      req.session.save((error) => {
        if (error) return res.status(500).send("Session error.");
        res.redirect("/dashboard");
      });
    });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).render("register", {
        error: "An account with this email already exists."
      });
    }

    res.status(500).send("Registration failed.");
  }
};

// Display login form.
exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

// Log in an existing tenant.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).render("login", {
        error: "Please enter your email and password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    // Verify the password against its stored hash.
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!passwordMatches) {
      return res.status(401).render("login", {
        error: "Invalid email or password."
      });
    }

    req.session.regenerate((error) => {
      if (error) return res.status(500).send("Session error.");

      req.session.userId = user._id.toString();

      req.session.save((error) => {
        if (error) return res.status(500).send("Session error.");
        res.redirect("/dashboard");
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed.");
  }
};

// Log out the current user.
exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).send("Logout failed.");

    // Clear the session cookie.
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};