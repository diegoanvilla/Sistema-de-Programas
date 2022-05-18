const nodeSchedule = require("node-schedule");
const axios = require("axios");
const Plan = require("./models/Plans");
const findEveryUserAndAddProfits = async () => {
  nodeSchedule.scheduleJob("50 * * * *", async () => {
    console.log("corriendo");
    let moderado;
    try {
      const index = await axios.get(process.env.GET_SP);
      const btc = await axios.get(process.env.GET_BTC);
      process.env.SP = parseFloat(index.data[0].price);
      process.env.BTC = parseFloat(btc.data[0].price);
      moderado = (parseFloat(process.env.SP) + parseFloat(process.env.BTC)) / 2;
      await updatePlan(process.env.SP, "1", "CD");
      await updatePlan(moderado, "2", "MD");
      await updatePlan(process.env.BTC, "3", "AD");
    } catch (err) {
      console.log(err);
    }
  });
};

const updatePlan = async (value, plan, dia) => {
  console.log(value);
  if (value == NaN) return;
  await Plan.findOne({ plan: plan })
    .then(async (doc) => {
      const porcentajeDia = (
        ((parseFloat(value) - parseFloat(doc.historialDia[0])) /
          parseFloat(doc.historialDia[0])) *
        100
      ).toFixed(2);
      process.env[dia] = `${porcentajeDia}%`;
      await Plan.findOneAndUpdate(
        { plan: plan },
        {
          $push: {
            historialDia: {
              $each: [parseFloat(value).toFixed(2)],
              $slice: -24,
            },
          },
          $set: { porcentajeDia: `${porcentajeDia}%` },
        }
      );
    })
    .then(console.log("Updated Plan"))
    .catch(console.log);
};

module.exports = findEveryUserAndAddProfits;
