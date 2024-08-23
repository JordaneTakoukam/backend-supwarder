const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    loginId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    uris: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
      required: false,
    },
    customFields: [
      {
        type: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    isSensitive: {
      type: Boolean,
      default: false,
    },
    vault: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vault",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
