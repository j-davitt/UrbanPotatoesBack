'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const movieReviews = new Schema({
  display_title:{ type: String, required: true },
  mpaa_rating:{ type: String, required: false },
  byline:{ type: String, required: false },
  headline:{ type: String, required: false},
  summary_short:{ type: String, required: false },
});

const reviewModel = mongoose.model('moviereview', movieReviews);

module.exports = reviewModel;
