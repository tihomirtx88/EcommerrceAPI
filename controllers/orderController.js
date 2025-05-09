const Product = require("./../models/Product");
const Order = require("./../models/Order");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { checkPermissions } = require("./../utils/checkPermissions");

const fakeStripeAPI = async ({ amount, currency }) => {
  const clientScret = "someRadnom";
  return { clientScret, amount };
};

const getAllOrders = async (req, res) => {
  // Get pagination params from query string
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Count total orders
  const totalOrders = await Order.countDocuments();

  // Fetch paginated orders
  const orders = await Order.find({})
    .sort('-createdAt') 
    .skip(skip)
    .limit(limit);

  const numOfPages = Math.ceil(totalOrders / limit);

  res.status(StatusCodes.OK).json({
    orders,
    count: orders.length,
    totalOrders,
    numOfPages,
  });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(
      `There is no order with id: ${orderId}`
    );
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee, name, address } = req.body;

  if (!cartItems || cartItems.length < 1) {
    console.log('No cart items provided');
    throw new CustomError.BadRequestError("No cart items provided!");
  }

  if (!tax || !shippingFee) {
    console.log('Please provide tax and shipping fee');
    throw new CustomError.BadRequestError("Please provide tax and shipping fee");
  }

  if (!name || !address) {
    console.log('Please provide shipping name and address');
    throw new CustomError.BadRequestError("Please provide shipping name and address");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id: ${item.product}`
      );
    }

    const { name, image, price, _id } = dbProduct;

    const singleOderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    ///add item to order
    orderItems = [...orderItems, singleOderItem];
    //calculate subtotal
    subtotal += item.amount * price;
  }

  //calculcate total
  const total = shippingFee + tax + subtotal;

  //get cleiant secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    name,
    address,
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientScret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientScret: order.clientScret });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(
      `There is no order with id: ${orderId}`
    );
  }

  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
