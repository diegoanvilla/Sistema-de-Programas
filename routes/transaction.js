const express = require("express");
const router = express.Router();
const Plan = require("../models/Plans");
const User = require("../models/User");
const { ensureAuthenticated } = require("../config/auth");
const Telegraf = require("telegraf");
const bot = require("../telegram");
const Markup = Telegraf.Markup;

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

router.post("/takeFund", ensureAuthenticated, async (req, res, next) => {
  const { takeFund } = req.body;
  console.log(req.body);
  if (!takeFund) {
    res.status(400).send("El numero debe ser mayor a 0");
  } else {
    res.render("retirar-pagoMovil.ejs", {
      fund: takeFund,
    });
  }
});

router.post("/confirmRetiro", ensureAuthenticated, async (req, res) => {
  const { telefono, nombre, cedula, banco, amount } = req.body;
  const ref = `${req.user.plan.length}PM`;
  if (req.user.invertido < amount) {
    res.status(400).send("Cantidad Insuficiente");
  } else {
    const transaction = {
      type: "Pago Movil",
      status: "Procesando",
      ammount: amount * -1,
      user: req.user.name,
      fund: amount * -1,
      ref: ref,
      description: `Efectuando Transferencia de ${amount * 5}Bs`,
    };
    const planData = getUserPlan(req.user.plan.number);
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { transacciones: transaction },
        $set: {
          invertido: req.user.invertido - amount,
          "plan.invested": planData
            ? req.user.plan.invested - amount / planData.comodidad
            : 0,
        },
      },
      { returnOriginal: false }
    )
      .then((user) => {
        const mensaje = `El usuario \n${req.user.name} \nCorreo ${
          req.user.email
        } \nHa pedido un pago movil de ${
          amount * 5
        } Bs\nSus datos:\nTelefono: ${telefono}\nNombre: ${nombre}\nCedula: ${cedula}\nBanco: ${banco}`;
        let clientButton = [
          Markup.button.callback(
            "Confirmar",
            `Confirmar ${req.user._id} ${
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
});

router.post("/subscribetoplan/", ensureAuthenticated, async (req, res) => {
  const { invertido, _id } = req.user;
  let balance;
  const plan = req.body.data;
  Plan.findOne({ plan: plan }).then((doc) => {
    if (req.user.plan.number == plan) {
      res.status(500).send("No puedes escoger el mismo plan");
    } else {
      if (req.user.plan.number) {
        const planData = getUserPlan(req.user.plan.number);
        balance = planData.comodidad * req.user.plan.invested;
      }

      User.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            "plan.name": doc.name,
            "plan.number": doc.plan,
            "plan.invested":
              (balance ? balance : invertido) / doc.historialDia[23],
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

module.exports = router;
