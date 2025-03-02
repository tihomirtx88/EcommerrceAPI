const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'emmanuel98@ethereal.email',
        pass: 'r9Ch91GEK2hHTXufs6'
    }
});

  const info = await transporter.sendMail({
    from: '"Support Team" <support@ethereal.email>', 
    to, 
    subject,
    text,
    html,
  });
};


module.exports = sendEmail;