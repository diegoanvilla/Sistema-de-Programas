const User = require("./models/User");
const Plan = require("./models/Plans");
const Telegraf = require("telegraf");
const mongoose = require("mongoose");
const bot = new Telegraf.Telegraf(process.env.BOT_REPUESTO);
bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "hello there! Welcome to my new telegram bot.",
    {}
  );
});
bot.action(/aprobar (.+)/, async (ctx) => {
  const info = ctx.match[1].split(" ");
  try {
    await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(info[0]) },
      {
        $set: {
          "transacciones.$[elemX].status": "Confirmado",
          "transacciones.$[elemX].description": "Abonado",
        },
        $inc: { invertido: info[2], balance: info[2] },
      },
      {
        arrayFilters: [
          {
            "elemX._id": new mongoose.Types.ObjectId(info[1]),
            "elemX.status": "Procesando",
          },
        ],
      }
    ).then((user) => {
      setUserStartingPosition(user, info[2]);
      bot.telegram.sendMessage(process.env.TELEGRAM_ID, "Aprobado");
    });
  } catch (err) {
    console.log(err);
  }
});

bot.action(/Confirmar (.+)/, async (ctx) => {
  const info = ctx.match[1].split(" ");
  try {
    await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(info[0]) },
      {
        $set: {
          "transacciones.$[elemX].status": "Confirmado",
          "transacciones.$[elemX].description": "Retirado",
        },
      },
      {
        arrayFilters: [
          {
            "elemX._id": new mongoose.Types.ObjectId(info[1]),
            "elemX.status": "Procesando",
          },
        ],
      }
    ).then((user) => {
      setUserStartingPosition(user, info[2]);
      bot.telegram.sendMessage(process.env.TELEGRAM_ID, "Aprobado");
    });
  } catch (err) {
    console.log(err);
  }
});

bot.command("apagar", (ctx) => {
  process.env.ON = 0;
  bot.telegram.sendMessage(ctx.chat.id, "Pagina Apagada.", {});
  console.log(process.env.ON);
});
bot.command("encender", (ctx) => {
  process.env.ON = 1;
  bot.telegram.sendMessage(ctx.chat.id, "Pagina Online", {});
  console.log(process.env.ON);
});
bot.launch();

const setUserStartingPosition = async (user, amount) => {
  const plan = user.plan.number;
  if (!plan) return;
  let newUserInvestedBalance;
  await Plan.findOne({ plan: plan }).then(async (doc) => {
    newUserInvestedBalance = amount / doc.historialDia[23];
    await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { "plan.invested": newUserInvestedBalance } }
    );
  });
};

module.exports = bot;
