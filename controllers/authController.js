const User = require("./../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");

const register = async (req, res) => {
    const { email } = req.body;

    const emailAlreadyExist = await User.findOne({email});

    if (emailAlreadyExist) {
        throw new CustomError.BadRequestError('Email alredy exists!');
    }
    const user = await User.create(req.body);
    res.status(StatusCodes.CREATED).json({user})
};

const login = async (req, res) => {
    res.send('ok');
};

const logout = async (req, res) => {
    res.send('ok');
};

module.exports= {
    register, 
    login,
    logout
};