const PasswordSchema = require("../models/Passwords");

const generatePassword = (
  length,
  upperCase,
  minUpperCase,
  lowerCase,
  minLowerCase,
  digits,
  minDigits,
  specialChars,
  minSpecialChars,
  avoidAmbiguous
) => {
  const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
  const digitChars = "0123456789";
  const specialCharsSet = "!@#$%^&*()_+[]{}|;:,.<>?";
  const ambiguousChars = "ILO0S5";

  let allChars = "";
  let password = "";
  let numUpperCase = 0;
  let numLowerCase = 0;
  let numDigits = 0;
  let numSpecialChars = 0;

  if (upperCase)
    allChars += avoidAmbiguous
      ? upperCaseChars.replace(/[ILO0]/g, "")
      : upperCaseChars;
  if (lowerCase)
    allChars += avoidAmbiguous
      ? lowerCaseChars.replace(/[s5]/g, "")
      : lowerCaseChars;
  if (digits) allChars += digitChars;
  if (specialChars)
    allChars += avoidAmbiguous
      ? specialCharsSet.replace(/[ILO0S5]/g, "")
      : specialCharsSet;

  // Ensure minimum requirements are met
  while (numUpperCase < minUpperCase && upperCase && password.length < length) {
    password += upperCaseChars.charAt(
      Math.floor(Math.random() * upperCaseChars.length)
    );
    numUpperCase++;
  }
  while (numLowerCase < minLowerCase && lowerCase && password.length < length) {
    password += lowerCaseChars.charAt(
      Math.floor(Math.random() * lowerCaseChars.length)
    );
    numLowerCase++;
  }
  while (numDigits < minDigits && digits && password.length < length) {
    password += digitChars.charAt(
      Math.floor(Math.random() * digitChars.length)
    );
    numDigits++;
  }
  while (
    numSpecialChars < minSpecialChars &&
    specialChars &&
    password.length < length
  ) {
    password += specialCharsSet.charAt(
      Math.floor(Math.random() * specialCharsSet.length)
    );
    numSpecialChars++;
  }

  // Fill the rest with random characters
  while (password.length < length) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join(""); // Shuffle the password
};

exports.generatePassword = async (req, res) => {
  const {
    length = 12,
    upperCase = false,
    minUpperCase = 0,
    lowerCase = true,
    minLowerCase = 0,
    digits = true,
    minDigits = 0,
    specialChars = false,
    minSpecialChars = 0,
    avoidAmbiguous = false,
  } = req.body;

  try {
    if (length < 1)
      return res.status(400).json({ error: "Length must be at least 1" });
    const password = generatePassword(
      length,
      upperCase,
      minUpperCase,
      lowerCase,
      minLowerCase,
      digits,
      minDigits,
      specialChars,
      minSpecialChars,
      avoidAmbiguous
    );

    const savedPessord = await PasswordSchema.create({
      name: req.body.name,
      password: password,
      owner: req.user.id,
    });

    res.json({password});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};









// Récupérer tous les mots de passe
exports.getAllPasswords = async (req, res) => {
  try {
    // Récupère tous les mots de passe appartenant à l'utilisateur connecté
    const passwords = await PasswordSchema.find({ owner: req.user.id });
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};








// Supprimer un mot de passe par ID
exports.deletePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const password = await PasswordSchema.findById(id);

    if (!password) {
      return res.status(404).json({ message: 'Mot de passe non trouvé' });
    }

    // Vérifier si l'utilisateur qui fait la demande est autorisé (propriétaire du mot de passe)
    if (password.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Autorisation refusée' });
    }

    // Supprimer le mot de passe si l'utilisateur est autorisé
    await PasswordSchema.findByIdAndDelete(id);
    res.json({ message: 'Mot de passe supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
