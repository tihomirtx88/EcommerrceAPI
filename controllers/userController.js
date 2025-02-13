const User = require('./../models/User');
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");

const getAllUsers = async (req, res) => {
    const users = await User.find({role: 'user'}).select('-password');
    res.status(StatusCodes.OK).json({users});
};

const getSingleUser = async (req, res) => {
    res.send("ok");
};

const showCurrentUser = async (req, res) => {
    res.send("ok");
};

const updateUser = async (req, res) => {
    res.send("ok");
};

const updateUserPassword = async (req, res) => {
    res.send("ok");
};

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
};