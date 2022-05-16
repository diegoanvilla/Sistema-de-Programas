const nodeSchedule = require("node-schedule");
const axios = require("axios");
const Plan = require("./models/Plans");
const findEveryUserAndAddProfits = async () => {
  nodeSchedule.scheduleJob("15 * * * *", async () => {
    console.log("corriendo");
    await updateConservador();
  });
};

const updateConservador = async () => {
  await axios
    .get(process.env.GET_SP)
    .then(async (response) => {
      await Plan.findOneAndUpdate(
        { plan: "1" },
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
