const Vault = require("../models/Vault");

module.exports = async (req, res, next) => {
  const userId = req.user.id;
  const { vaultId } = req.params;

  const vault = await Vault.findById(vaultId);

  if (!vault) {
    return res.status(404).json({ message: "Trousseau non trouvé" });
  }

  if (vault.creator.equals(userId) || vault.members.includes(userId)) {
    return next();
  }

  res.status(403).json({ message: "Accès interdit" });
};
