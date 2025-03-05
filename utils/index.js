const { isTokeValid, createJWT, atachCookieToResponse } = require('./jwt');
const { createTokenUser } = require("./../utils/createTokeUser");
const { checkPermissions } = require("./../utils/checkPermissions");
const sendVerificationEmail = require("./sendVerificationEmail");
const sendRessetPasswordEmail = require("./sendRessetPasswordEmail");

module.exports = {
    isTokeValid, 
    createJWT,
    atachCookieToResponse,
    createTokenUser,
    checkPermissions,
    sendVerificationEmail,
    sendRessetPasswordEmail
};