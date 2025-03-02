const nodemailer = require("nodemailer");
const nodeEmailerConfig = require("./nodeEmailerConfig");

const sendEmail = async ({ to, subject, text, html }) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodeEmailerConfig);

  return transporter.sendMail({
    from: '"Support Team" <support@ethereal.email>', 
    to, 
    subject,
    text,
    html,
  });
};


module.exports = sendEmail;