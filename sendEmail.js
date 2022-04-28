const nodemailer = require("nodemailer");
const User = require("./models/User");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const smtpTransport = nodemailer.createTransport({
  host: "apolonftgroup.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
async function sendConfirmationEmail(user) {
  await bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user._id.toString(), salt, async (err, hash) => {
      if (err) throw err;
      const rand = hash;
      // await User.findOneAndUpdate(
      //   { _id: user._id },
      //   { $set: { confirmLink: rand } }
      // ).then(async (confirmingUser) => {
      // const data = await ejs
      //   .renderFile(__dirname + "/views/mail/confirmEmail.ejs", {
      //     username: user.name,
      //     enlace: `http://localhost:80/confirm/${rand}`,
      //   })
      //   .catch((err) => console.log(err));
      // const info = await smtpTransport.sendMail({
      //   from: "'Apolo NFT Group Server' <noreply@apolonftgroup.com>",
      //   to: user.email,
      //   subject: "Confirmacion de Correo Electronico",
      //   attachments: [
      //     {
      //       filename: "LOGO APOLO.png",
      //       path: __dirname + "/img/LOGO APOLO.png",
      //       cid: "logo",
      //     },
      //   ],
      //   html: data,
      // setTimeout(() => {
      //   console.log("Borrando");
      //   confirmingUser.confirmLink = "";
      //   confirmingUser
      //     .save()
      //     .then((doc) => {
      //       console.log(doc);
      //     })
      //     .catch((err) => console.log(err));
      // }, 1000 * 60 * 2);
      // });
      // });
    });
  });
  return;
}
module.exports = sendConfirmationEmail;
