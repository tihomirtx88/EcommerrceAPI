const Product = require('./../models/Product');
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const porduct = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({porduct});
};

const getAllProducts = async (req, res) => {
    const porducts = await Product.find({});
    res.status(StatusCodes.OK).json({porducts, count: porducts.length});
};

const getSingleProduct = async (req, res) => {
    res.send("ok");
};

const updateProduct = async (req, res) => {
    res.send("ok");
};

const deleteProduct = async (req, res) => {
    res.send("ok");
};

const uploadImage = async (req, res) => {
    res.send("ok");
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    uploadImage,
    deleteProduct
};