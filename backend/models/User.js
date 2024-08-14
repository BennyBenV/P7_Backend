const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  // email unique et obligatoire
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Application du plugin au schéma avant d'en faire un modèle
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);