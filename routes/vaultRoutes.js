const express = require("express");
const router = express.Router();
const {
  createVault,
  addMember,
  getVaults,
  getVaultById,
  deleteVault,
} = require("../controllers/vaultController");
const { authenticateJWT } = require("../middlewares/auth");

// Créer un trousseau
router
  .post("/", authenticateJWT, createVault)

  .get("/", authenticateJWT, getVaults)

  .get("/:id", authenticateJWT, getVaultById)

  .delete("/:id", authenticateJWT, deleteVault)

  // Partager un trousseau avec un autre utilisateur
  .put("/:id/addmember", authenticateJWT, addMember);

module.exports = router;
