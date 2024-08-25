const asyncHandler = require("express-async-handler");
const Vault = require("../models/Vault");
const User = require("../models/User");

// Créer un trousseau
exports.createVault = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Vérifier si un trousseau avec le même nom existe déjà
    const existVault = await Vault.findOne({ name: name });

    if (existVault) {
      return res.status(400).json({ message: "Le nom du trousseau existe déjà" });
    }

    // Rechercher l'utilisateur actuel pour obtenir son email
    const existUser = await User.findById(userId);
    if (!existUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Créer un nouveau trousseau avec l'utilisateur actuel comme propriétaire et admin
    const newVault = new Vault({
      name,
      owner: userId,
      sharedWith: [{ user: userId, permissions: "admin", email: existUser.email }],
    });

    // Sauvegarder le trousseau dans la base de données
    await newVault.save();

    res.status(201).json(newVault);
  } catch (error) {
    console.log("Erreur =", error);
    res.status(500).json({ message: "Erreur lors de la création du trousseau" });
  }
};


// Ajouter un membre
// exports.addMember = async (req, res) => {
//   try {
//     const { memberId } = req.body;
//     const vault = await Vault.findById(req.params.id);

//     if (!vault) {
//       return res.status(404).json({ message: "Trousseau non trouvé" });
//     }

//     // Vérifier si l'utilisateur est le propriétaire
//     if (vault.owner.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ message: "Autorisation refusée" });
//     }

//     const permissions = req.body.permissions || "read";

//     if (vault.sharedWith.some((user) => user.user.toString() === memberId)) {
//       return res
//         .status(400)
//         .json({ message: "L'utilisateur a déjà accès à ce trousseau" });
//     }

//     vault.sharedWith.push({ user: memberId, permissions });
//     await vault.save();

//     res.status(200).json(vault);
//   } catch (error) {
//     console.log("Erreur = ", error);

//     res.status(500).json({ message: "Erreur lors de l'ajout du membre" });
//   }
// };

// Ajouter un membre
exports.addMember = async (req, res) => {
  try {
    const { memberId, permission } = req.body; // Ici, memberId est en fait l'email du membre

    // Vérifier si memberId et permission sont fournis, sinon ne rien faire
    if (!memberId || !permission) {
      return res.status(400).json({ message: "Aucun membre à ajouter" });
    }

    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({ message: "Trousseau non trouvé" });
    }

    // Vérifier si l'utilisateur qui fait la demande est autorisé (propriétaire du trousseau)
    if (vault.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Autorisation refusée" });
    }

    // Ajouter le créateur (propriétaire) avec le privilège d'administrateur, s'il n'est pas déjà dans la liste
    if (!vault.sharedWith.some((sharedUser) => sharedUser.user.toString() === req.user._id.toString())) {
      vault.sharedWith.push({ user: req.user._id, permissions: "admin" });
    }

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email: memberId });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si la permission est valide
    const validPermissions = ["read", "write", "admin"];
    if (!validPermissions.includes(permission)) {
      return res.status(400).json({ message: "Permission invalide" });
    }

    // Vérifier si l'utilisateur est déjà dans le trousseau
    if (vault.sharedWith.some((sharedUser) => sharedUser.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: "L'utilisateur a déjà accès à ce trousseau" });
    }

    // Ajouter l'utilisateur à la liste des partages
    vault.sharedWith.push({ user: user._id, permissions: permission, email: user.email });

    // Sauvegarder les modifications apportées au trousseau
    await vault.save();

    res.status(200).json(vault);
  } catch (error) {
    console.error("Erreur =", error);
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
