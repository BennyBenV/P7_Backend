const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  try {
    // cryptage du mdp
    const hash = await bcrypt.hash(req.body.password, 10);
    // création d'un nouvel user avec l'email et le mdp
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    // enregistrement du user dans la base de donnée
    await user.save();
    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    console.log("Error :", error);
    res.status(400).json({ error });
  }
};

exports.login = async (req, res, next) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });
    if (!userFound) {
      return res
        .status(401)
        .json({ error: "Identifiant ou Mot de passe incorrect !" });
    }
    const valid = await bcrypt.compare(req.body.password, userFound.password);
    if (!valid) {
      return res
        .status(401)
        .json({ error: "Identifiant ou Mot de passe incorrect !" });
    }
    res.status(200).json({
      userId: userFound._id,
      token: jwt.sign({ userId: userFound._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      }),
    });
  } catch (error) {
    console.log("Error :", error);
    res.status(500).json({ error });
  }
};