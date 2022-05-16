const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  plan: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  invertido: {
    type: Number,
    required: true,
  },
  historialDia: {
    type: Array,
    default: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    required: true,
  },
});

const Plan = mongoose.model("Plan", PlanSchema);

module.exports = Plan;
