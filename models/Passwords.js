const mongoose = require("mongoose");
const { Schema } = mongoose;

const PasswordSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Password", PasswordSchema);