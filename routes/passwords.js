const express = require("express");
const router = express.Router();
const PasswordController = require("../controllers/passwordController");
const { authenticateJWT } = require("../middlewares/auth");

// Générer un mot de passe
router.post("/generate", authenticateJWT, PasswordController.generatePassword);
router.get("/", authenticateJWT, PasswordController.getAllPasswords);
router.delete("/:id", authenticateJWT, PasswordController.deletePassword);


module.exports = router;
