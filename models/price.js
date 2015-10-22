'use strict';

let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
  origin: {
    type: String,
    required: true
  },
  destinations: [{
    destination: String,
    cost: Number
  }]
});

let PriceModel = mongoose.model('Price', Schema);

module.exports = PriceModel;
