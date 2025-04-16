const Product = require("./../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const path = require("path");

const createProduct = async (req, res) => {
  if (req.files && req.files.image) {
    const image = req.files.image;

    const imageName = `${Date.now()}-${image.name}`;
    const imagePath = path.join(__dirname, "../public/uploads/", imageName);

    await image.mv(imagePath);

    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${imageName}`;

    req.body.image = imageUrl;
  }

  req.body.user = req.user.userId;

  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  try {
    const { search, category, company, sort, price, freeShipping } = req.query;
    const queryObject = {};

    // Filter by search term (name)
    if (search) {
      queryObject.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category && category !== "all") {
      queryObject.category = category;
    }

    // Filter by company
    if (company && company !== "all") {
      queryObject.company = company;
    }

    // Filter by freeShipping
    if (freeShipping === "true") {
      queryObject.freeShipping = true;
    }

    // Filter by price
    if (price) {
      queryObject.price = { $lte: Number(price) };
    }

    let result = Product.find(queryObject);

    switch (sort) {
      case "a-z":
        result = result.sort("name");
        break;
      case "z-a":
        result = result.sort("-name");
        break;
      case "low":
        result = result.sort("price");
        break;
      case "high":
        result = result.sort("-price");
        break;
      default:
        result = result.sort("name");
        break;
    }

    //Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalProducts / limit);

    result = result.skip(skip).limit(limit);

    const products = await result;
    res
      .status(200)
      .json({
        products,
        count: products.length,
        totalProducts,
        numOfPages,
        currentPage: page,
      });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate({
    path: "reviews",
    model: "Review",
  });

  if (!product) {
    throw new CustomError.NotFoundError(
      `There is no product with id: ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );

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

  res.status(StatusCodes.OK).json({ msg: "Product is success deleted" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }

  const image = req.files.image;

  if (!image.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxsize = 1024 * 1023;

  if (image.size > maxsize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller then 1mb"
    );
  }

  const imageName = `${Date.now()}-${image.name}`;

  const imagePath = path.join(__dirname, "../public/uploads/", imageName);

  await image.mv(imagePath);

  // Create the absolute URL for the image
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${imageName}`;

  res.status(StatusCodes.OK).json({ image: imageUrl });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
};
