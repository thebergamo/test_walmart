'use strict';

let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  roads: [{
    origin: String,
    destination: String,
    cost: Number
  }]
});

let MapModel = mongoose.model('Map', Schema);

module.exports = MapModel;
