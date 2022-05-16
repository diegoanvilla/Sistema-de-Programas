const nodeSchedule = require("node-schedule");
const axios = require("axios");
const Plan = require("./models/Plans");
const findEveryUserAndAddProfits = async () => {
  nodeSchedule.scheduleJob("15 * * * *", async () => {
    console.log("corriendo");
    await updatePlan(process.env.GET_SP, "1");
    await updatePlan(process.env.GET_BTC, "3");
  });
};

const updatePlan = async (link, plan) => {
  await axios
    .get(link)
    .then(async (response) => {
      await Plan.findOneAndUpdate(
        { plan: plan },
        {
          $push: {
            historialDia: { $each: [response.data[0].price], $slice: -24 },
          },
        }
      )
        .then(console.log("Updated Plan"))
        .catch(console.log);
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = findEveryUserAndAddProfits;
