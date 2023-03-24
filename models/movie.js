"use strict";

const mongoose = require("mongoose");

const { Schema } = mongoose;

const movieSchema = new Schema({
  movieId: { type: Number },
  title: { type: String, required: true },
  description: { type: String, required: true },
  poster: { type: String, required: true },
  video: { type: Boolean, required: true },
  // rating: { type: Number, required: true},
  comment: { type: Array, required: false },


});

const movieModel = mongoose.model('movie', movieSchema);

module.exports = movieModel;
