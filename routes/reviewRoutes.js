const express = require('express');
const router = express.Router();
const { authenticateUser } = require("./../middleware/authentication");

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getReviewsByProduct,
} = require('../controllers/reviewController');


// Route to get reviews for a specific product by productId
router.route('/product/:productId').get(getReviewsByProduct);

router.route('/').post(authenticateUser, createReview).get(getAllReviews);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

module.exports = router;
