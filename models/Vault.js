const mongoose = require("mongoose");
const { Schema } = mongoose;

const VaultSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        email: {
          type: String,
          required: true,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        permissions: {
          type: String,
          enum: ["read", "write", "admin"],
          default: "read",
        },
      },
    ],
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "VaultItem",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vault", VaultSchema);
