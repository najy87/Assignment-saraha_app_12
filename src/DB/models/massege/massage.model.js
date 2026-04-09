import { model, Schema, SchemaTypes } from "mongoose";

const schema = new Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: function () {
        if (this.attatchments.length == 0) return true;
        return false;
      },
    },
    attatchments: {
      type: [String],
    },
    reciver: {
      type: SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
export const Massege = model("Massege", schema);
