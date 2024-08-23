const express = require("express");
const router = express.Router();
const {
  addItem,
  deleteItem,
  updateItem,
  getItemById,
  getItemsByVaultId,
} = require("../controllers/itemController.Js");
const roleMiddleware = require("../middlewares/roleMiddleware");

router
  .post("/", roleMiddleware, addItem)
  .get("/vaultId/:id", roleMiddleware, getItemsByVaultId)
  .get("/:id", roleMiddleware, getItemById)
  .put("/:id", roleMiddleware, updateItem)
  .delete("/:id", roleMiddleware, deleteItem);

module.exports = router;
