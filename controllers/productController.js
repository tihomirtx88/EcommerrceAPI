const Product = require("./../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const porduct = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ porduct });
};

const getAllProducts = async (req, res) => {
  const porducts = await Product.find({});
  res.status(StatusCodes.OK).json({ porducts, count: porducts.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(
      `There is no product with id: ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
   const { id: productId } = req.params;

   const product = await Product.findByIdAndUpdate({ _id: productId }, req.body, {new: true, runValidators: true});

   if (!product) {
    throw new CustomError.NotFoundError(
      `There is no product with id: ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(
      `There is no product with id: ${productId}`
    );
  }

  await product.remove();

  res.status(StatusCodes.OK).json({ msg: 'Product is success deleted' });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError(
        'No File Uploaded'
    );
  }

  const image = req.files.image;


  if (!image.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  const maxsize = 1024 * 1023;

  if (image.size > maxsize) {
    throw new CustomError.BadRequestError(
        'Please upload image smaller then 1mb'
    );
  }

  const imagePath = path.join(__dirname, '../public/uploads/' + `${image.name}`);

  await image.mv(imagePath);

  res.status(StatusCodes.OK).json({ image: `/uploads/${image.name}` });


};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
};
