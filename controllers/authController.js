const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Enregistrement d'un utilisateur
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'enregistrement" });
  }
};

// Connexion d'un utilisateur

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Retourner le token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !bcrypt.compare(oldPassword, user.password)) {
      return res.status(400).json({ message: "Ancien mot de passe invalide" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Mot de passe changé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors du changement de mot de passe" });
  }
};
