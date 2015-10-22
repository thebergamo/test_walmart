'use strict';

let Boom = require('boom');
let Promise = require('bluebird');

function PriceController (db) {
  this.database = db;
  this.model = Promise.promisifyAll(db.Price);
}

// [GET] /prices
PriceController.prototype.index = function (request, reply) {
  this.model.findAsync({})
  .then((prices) => {
    reply(prices);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [GET] /price/{id}
PriceController.prototype.show = function (request, reply) {
  let id = request.params.id;

  this.model.findOneAsync({_id: id})
  .then((price) => {
    if (!price) {
      reply(Boom.notFound());
      return;
    }
    reply(price);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [POST] /price
PriceController.prototype.create = function (request, reply) {
  let payload = request.payload;

  this.model.createAsync(payload)
  .then((price) => {
    reply(price).code(202);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [PUT] /price/{id}
PriceController.prototype.update = function (request, reply) {
  let id = request.params.id;
  let payload = request.payload;

  this.model.findOneAndUpdateAsync({_id: id}, payload, { new: true })
  .then((price) => {
    reply(price);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [DELETE] /price/{id}
PriceController.prototype.destroy = function (request, reply) {
  let id = request.params.id;

  this.model.removeAsync({_id: id})
  .then(() => {
    reply();
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

module.exports = PriceController;
