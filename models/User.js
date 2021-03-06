const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransaccionesSchema = new mongoose.Schema({
  user: { type: String },
  ammount: { type: Number },
  status: { type: String },
  ref: {
    type: String,
    default: "",
  },
  date: { type: Date, default: Date.now },
  type: { type: String },
  description: { type: String, default: "" },
  receipt: { type: String },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  invertido: {
    type: Number,
    required: true,
    default: 0.0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  plan: {
    name: { type: String, default: "" },
    number: { type: Number, default: "" },
    date: { type: Date, default: Date.now() },
    invested: { type: Number, required: true, default: 0 },
  },

  transacciones: [TransaccionesSchema],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
