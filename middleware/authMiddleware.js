const User = require("../models/User");

// Protect pages that require login.
exports.requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    // Confirm that the user still exists.
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.redirect("/login");
    }

    // Make the user available to controllers.
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed.");
  }
};