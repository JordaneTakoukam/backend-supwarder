const asyncHandler = require("express-async-handler");
const Vault = require("../models/Vault");
const User = require("../models/User");

// Créer un trousseau
exports.createVault = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const existVault = await Vault.find({ name: name });
    if (existVault) {
      return res
        .status(400)
        .json({ message: "Le nom du trousseau existe déjà" });
    }

    const newVault = new Vault({
      name,
      owner: userId,
      sharedWith: [{ user: userId, permissions: "read" }],
    });
    await newVault.save();

    res.status(201).json(newVault);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du trousseau" });
  }
};

// Ajouter un membre
exports.addMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({ message: "Trousseau non trouvé" });
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (vault.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Autorisation refusée" });
    }

    const permissions = req.body.permissions || "read";

    if (vault.sharedWith.some((user) => user.user.toString() === memberId)) {
      return res
        .status(400)
        .json({ msg: "L'utilisateur a déjà accès à ce trousseau" });
    }

    vault.sharedWith.push({ user: memberId, permissions });
    await vault.save();

    res.status(200).json(vault);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du membre" });
  }
};

exports.getVaults = asyncHandler(async (req, res) => {
  const vaults = await Vault.find({ owner: req.user._id }).populate(
    "sharedWith"
  );
  res.json(vaults);
});

exports.getVaultById = asyncHandler(async (req, res) => {
  const vault = await Vault.findById(req.params.id).populate("sharedWith");

  if (vault) {
    res.json(vault);
  } else {
    res.status(404);
    throw new Error("Vault not found");
  }
});

exports.updateVault = asyncHandler(async (req, res) => {
  const { name, members } = req.body;

  const vault = await Vault.findById(req.params.id);

  if (vault) {
    vault.name = name || vault.name;
    vault.members = members || vault.members;

    const updatedVault = await vault.save();
    res.json(updatedVault);
  } else {
    res.status(404);
    throw new Error("Vault not found");
  }
});

exports.deleteVault = asyncHandler(async (req, res) => {
  const vault = await Vault.findById(req.params.id);

  if (vault) {
    await Vault.findByIdAndDelete(req.params.id);
    res.json({ message: "Vault removed" });
    
  } else {
    res.status(404);
    throw new Error("Vault not found");
  }
});
