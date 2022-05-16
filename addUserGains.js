const nodeSchedule = require("node-schedule");
const axios = require("axios");
const Plan = require("./models/Plans");
const findEveryUserAndAddProfits = async () => {
  nodeSchedule.scheduleJob("57 * * * *", async () => {
    console.log("corriendo");
    try {
      const index = await axios.get(process.env.GET_SP);
      const btc = await axios.get(process.env.GET_BTC);
      process.env.SP = index.data[0].price;
      process.env.BTC = btc.data[0].price;
      await updatePlan(process.env.SP, "1");
      await updatePlan((process.env.SP + process.env.SP) / 2, "1");
      await updatePlan(process.env.BTC, "3");
    } catch (err) {
      console.log(err);
    }
  });
};

const updatePlan = async (value, plan) => {
  await Plan.findOneAndUpdate(
    { plan: plan },
    {
      $push: {
        historialDia: { $each: [value], $slice: -24 },
      },
    }
  )
    .then(console.log("Updated Plan"))
    .catch(console.log);
};

module.exports = findEveryUserAndAddProfits;
