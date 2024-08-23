const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticateJWT = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Aucun token, autorisation refusée" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = await User.findById(user.id).select("-password");
      next();
    });
  } catch (error) {
    res.status(401).json({ msg: "Token non valide" });
  }
};
