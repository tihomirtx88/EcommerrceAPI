const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return token;
};

const isTokeValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const atachCookieToResponse = ({ res, user }) => {

  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_EMV === 'production',
    signed: true
  });
};

module.exports = {
  isTokeValid,
  createJWT,
  atachCookieToResponse,
};
