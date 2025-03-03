const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return token;
};

const isTokeValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const atachSingleCookieToResponse = ({ res, user }) => {

  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_EMV === 'production',
    signed: true
  });
};

const atachCookieToResponse = ({ res, user, refreshToken }) => {

  const accessTokenJWT = createJWT({ payload: {user} });
  const refreshTokenJWT = createJWT({ payload: {user, refreshToken} });
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_EMV === 'production',
    signed: true,
    maxAge: 1000,
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_EMV === 'production',
    expires: new Date(Date.now() + oneDay),
    signed: true,
  });
};

module.exports = {
  isTokeValid,
  createJWT,
  atachCookieToResponse,
};
