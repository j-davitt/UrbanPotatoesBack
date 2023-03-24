'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({

  email:{ type: String, required: true },
  favoritelist:{ type: Array, required: true },
  watchlaterlist:{ type: Array, required: true },
  watchedlist:{ type: Array, required: true },

});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
