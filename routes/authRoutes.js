const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const {
  register,
  login,
  changePassword,
} = require("../controllers/authController");
const { authenticateJWT } = require("../middlewares/auth");

// Register route
router
  .post("/register", register)

  // Login route
  .post("/login", login)

  // Change password
  .put("/change-password", authenticateJWT, changePassword)

  // Google OAuth
  .get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  )

  .get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
      const payload = {
        id: req.user.id,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.redirect(`/?token=${token}`);
        }
      );
    }
  )

  // GitHub OAuth
  .get(
    "/github",
    passport.authenticate("github", {
      scope: ["user:email"],
    })
  )

  .get(
    "/github/callback",
    passport.authenticate("github", { session: false }),
    (req, res) => {
      const payload = {
        id: req.user.id,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.redirect(`/?token=${token}`);
        }
      );
    }
  )

  // Route pour démarrer l'authentification Microsoft
  .get("/microsoft", passport.authenticate("microsoft"))

  // Callback route pour Microsoft
  .get(
    "/microsoft/callback",
    passport.authenticate("microsoft", {
      session: false,
    }),
    (req, res) => {
      // Créez un JWT et envoyez-le au client
      const token = generateToken(req.user); // Implémentez la fonction generateToken pour créer un JWT
      res.json({ token });
    }
  );

// Fonction pour générer un JWT (à implémenter selon vos besoins)
function generateToken(user) {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

module.exports = router;
