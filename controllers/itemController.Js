const Item = require("../models/VaultItem");
const Vault = require("../models/Vault");

const generatePassword = (length) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Exemple d'utilisation dans l'ajout d'un élément
exports.addItem = async (req, res) => {
  try {
    const {
      name,
      loginId,
      uris,
      notes,
      customFields,
      attachments,
      isSensitive,
      vaultId,
      generatePasswordLength,
    } = req.body;
    const userId = req.user.id;

    const vault = await Vault.findById(vaultId);

    if (
      !vault ||
      (!vault.owner.equals(userId) &&
        !vault.sharedWith.some(
          (e) => e.user.toString() == userId && e.permissions === "write"
        ))
    ) {
      return res.status(403).json({ message: "Accès interdit au trousseau" });
    }

    const finalPassword = password || generatePassword(generatePasswordLength);
    const newItem = new Item({
      name,
      loginId,
      password: finalPassword,
      uris,
      notes,
      customFields,
      attachments,
      isSensitive,
      vault: vaultId,
    });
    await newItem.save();

    vault.items.push(newItem._id);
    await vault.save();

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout de l'élément" });
  }
};

// Lire un élément par ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("vault");
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lire tous les éléments d'un trousseau
exports.getItemsByVaultId = async (req, res) => {
  try {
    const items = await Item.find({ vault: req.params.vaultId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un élément par ID
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un élément par ID
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
