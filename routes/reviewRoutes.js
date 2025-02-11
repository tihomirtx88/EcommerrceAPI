const express = require('express');
const router = express.Router();

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.route('/').post(createReview).get(getAllReviews);

router
  .route('/:id')
  .get(getSingleReview)
  .patch( updateReview)
  .delete(deleteReview);

module.exports = router;
