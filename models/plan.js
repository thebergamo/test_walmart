'use strict';

let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pack: {
    minutes: Number, // minutos disponiveis na franquia
    extra: Number, // valor do minuto excedente (%) em cima do minuto avulso
    cost: Number // valor do plano
  }
});

let PlanModel = mongoose.model('Plan', Schema);

module.exports = PlanModel;
