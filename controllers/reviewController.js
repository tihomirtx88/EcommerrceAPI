const Review = require("./../models/Review");
const Product = require("./../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { checkPermissions } = require("./../utils/checkPermissions");

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  const isAlreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (isAlreadySubmitted) {
    throw new CustomError.BadRequestError("Already submitted for this product");
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({path: 'product', select: 'name company price'}).populate({path: 'user', select: 'name'});
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `There is no review with id: ${reviewId}`
    );
  }


  res.status(StatusCodes.OK).json({ review });
};

const getReviewsByProduct = async (req, res) => {
  //Find product
  const { productId } = req.params; 
  //find review byt this user id
  const reviews = await Review.find({ product: productId });

  if (!reviews || reviews.length === 0) {
    throw new CustomError.NotFoundError(
      `There are no reviews for product with id: ${productId}`
    );
  }
  
  res.status(StatusCodes.OK).json({ reviews });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { raitng, title, comment} = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `There is no review with id: ${reviewId}`
    );
  }

  checkPermissions(req.user, review.user);
  review.raitng = raitng;
  review.title = title;
  review.comment = comment;
  
  await review.save()

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `There is no review with id: ${reviewId}`
    );
  }

  checkPermissions(req.user, review.user);
  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Success! Review is removed" });
};

const getsingleProductReveiws = async (req, res) => {
    const {id: productId} = req.params;
    const reviews = await Review.find({product: productId});
    res.status(StatusCodes.OK).json({reviews});
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getsingleProductReveiws,
  getReviewsByProduct
};
