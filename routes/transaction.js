const express = require("express");
const router = express.Router();
const Plan = require("../models/Plans");
const User = require("../models/User");
const { ensureAuthenticated } = require("../config/auth");
const Telegraf = require("telegraf");
const mongoose = require("mongoose");
const https = require("https");

//BOT DE TELEGRAM CAMBIAR LUEGO A SU PROPIO ARCHIVO
const bot = new Telegraf.Telegraf(process.env.BOT);
const Markup = Telegraf.Markup;
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

//Empezamos

router.get("/getTransacionInfo/:id", async (req, res) => {
  try {
    if (!req.user) throw "Inicia sesion para escoger un plan";
    Plan.findOne({ plan: req.params.id }).then((doc) => {
      const { invertido } = req.user;
      res.render("popup.ejs", {
        plan: doc,
        invertido: invertido,
      });
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post("/addFund", ensureAuthenticated, async (req, res, next) => {
  const { fund } = req.body;

  if (!fund) {
    res.status(400).send("El numero debe ser mayor a 0");
  } else {
    res.render("pagoMovil.ejs", {
      fund: fund,
    });
  }
});

router.post("/confirmPayment", ensureAuthenticated, async (req, res) => {
  const { ref, amount } = req.body;
  if (!match(req.user.transacciones, ref).length) {
    const transaction = {
      type: "Pago Movil",
      status: "Procesando",
      ammount: amount,
      user: req.user.name,
      ref: ref,
      fund: amount,
      description: `Verificando referencia ${ref}`,
    };
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { transacciones: transaction },
      },
      { returnOriginal: false }
    )
      .then((user) => {
        const mensaje = `El usuario \n${req.user.name} \nCorreo ${
          req.user.email
        } \nHa realizado un pago movil de ${
          amount * 5
        } Bs con un numero de referencia ${ref}`;
        let clientButton = [
          Markup.button.callback(
            "Aprobar",
            `aprobar ${req.user._id} ${
              match(user.transacciones, ref)[0]._id
            } ${amount}`
          ),
        ];
        bot.telegram.sendMessage(
          process.env.TELEGRAM_ID,
          mensaje,
          Markup.inlineKeyboard([clientButton])
        );
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .send(
            "Un error ha ocurrido mientras se guardaban los datos de la transaccion."
          );
      });
  }
  res.status(400).end("Referencia Ya Registrada");
});

router.post("/processPayment", ensureAuthenticated, async (req, res) => {
  const { fund } = req.body;
  const ref = 1;
  if (ref) {
    const transaction = {
      type: "Pago Movil",
      user: req.user.name,
      ref: ref,
      fund: fund,
      description: `Se añadio ${fund}$ a tus fondos`,
    };
    await User.updateOne(
      { _id: req.user._id },
      {
        $inc: { balance: fund, invertido: fund },
        $push: { transacciones: transaction },
      },
      { useUnifiedTopology: true }
    )
      .then(() => {
        console.log("Transaccion Finalizada");
        res.status(200).send();
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .send(
            "Un error ha ocurrido mientras se guardaban los datos de la transaccion, comuniquese con soporte"
          );
      });
  }
});

router.post("/subscribetoplan/", ensureAuthenticated, async (req, res) => {
  const { invertido, _id } = req.user;
  const plan = req.body.data;
  Plan.findOne({ plan: plan }).then((doc) => {
    if (req.user.plan.number == plan) {
      res.status(500).send("No puedes escoger el mismo plan");
    } else {
      User.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            "plan.name": doc.name,
            "plan.number": doc.plan,
            "plan.invested": invertido / doc.historialDia[23],
          },
        }
      )
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send("Algo salio mal intente nuevamente");
        });
    }
  });
});

const match = (array, ref) =>
  array.filter((v) => {
    return v.ref == ref;
  });

const setUserStartingPosition = async (user, amount) => {
  console.log(user, amount);
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

module.exports = router;
