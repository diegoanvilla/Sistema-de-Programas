const getUserPlan = (plan) => {
  const enviromentPlans = [
    { planDiario: process.env.CD, comodidad: process.env.SP },
    {
      planDiario: process.env.MD,
      comodidad: (parseFloat(process.env.SP) + parseFloat(process.env.BTC)) / 2,
    },
    { planDiario: process.env.AD, comodidad: process.env.BTC },
  ];
  return enviromentPlans[plan - 1];
};
module.exports = getUserPlan;
