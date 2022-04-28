const nodeSchedule = require("node-schedule");
const Plan = require("./models/Plans");
const User = require("./models/User");
const https = require("https");
const findEveryUserAndAddProfits = () => {
  nodeSchedule.scheduleJob("44  */1 * * *", () => {
    https.get(process.env.GET_SP, (doc) => {
      doc.on("data", (d) => console.log(d));
      console.log(doc.statusCode, doc.headers);
    });
  });
};

module.exports = findEveryUserAndAddProfits;
