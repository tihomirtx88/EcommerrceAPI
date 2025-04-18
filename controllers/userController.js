const User = require('./../models/User');
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { createTokenUser, atachCookieToResponse, checkPermissions } = require("./../utils/index");

const getAllUsers = async (req, res) => {
    const users = await User.find({role: 'user'}).select('-password');
    res.status(StatusCodes.OK).json({users});
};

const getSingleUser = async (req, res) => {
    const user = await User.findOne({_id: req.params.id}).select('-password');

    if (!user) {
        throw new CustomError.UnauthenticatedError(`There is no user with id: ${req.params.id}`);
    }

    checkPermissions(req.user, user._id);

    res.status(StatusCodes.OK).json({user});
};

const showCurrentUser = async (req, res) => {
   
    res.status(StatusCodes.OK).json({user: req.user});
};

const updateUser = async (req, res) => {
    const { email, name } = req.body;
    console.log(req.body);
    

    if (!email || !name) {
        throw new CustomError.BadRequestError(`Please provide all values`);
    }

    const user = await User.findOne({_id: req.user.userId}, {email, name}, {new: true, runValidators: true});

    const tokenUser = createTokenUser(user);
    atachCookieToResponse({res, user: tokenUser});
    
    res.status(StatusCodes.OK).json({user: tokenUser});
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword} = req.body;

    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError(`Please provide both values`);
    }

    const user = await User.findOne({_id: req.user.userId}).select('+password');

    const isPasswordCorect = await user.comparePasswords(oldPassword);
    if (!isPasswordCorect) {
        throw new CustomError.UnAuthorizedError(`Invlaid Credentials`);
    }

    user.password = newPassword;

    await user.save();

    res.status(StatusCodes.OK).json({msg: 'Success! Password Updated!'});
};

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
};