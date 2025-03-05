const sendEmail = require("./sendEmail");

const sendRessetPasswordEmail = async ({
  name,
  email,
  token,
  origin,
}) => {
    
  //Must to create  on Front End URL ->
  const resetEmail = `${origin}/user/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset password by clicking on the following link : 
    <a href="${resetEmail}">Resset passowrd</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendRessetPasswordEmail;