'use strict';

let _ = require('lodash');
let Boom = require('boom');
let Graph = require('node-dijkstra');
let Promise = require('bluebird');

function MapController (db) {
  this.database = db;
  this.model = Promise.promisifyAll(db.Map);
}

// [GET] /map
MapController.prototype.index = function (request, reply) {
  this.model.findAsync({})
  .then((maps) => {
    reply(maps || []);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [GET] /map/{id}
MapController.prototype.show = function (request, reply) {
  let id = request.params.id;

  this.model.findOneAsync({_id: id})
  .then((map) => {
    if (!map) {
      reply(Boom.notFound());
      return;
    }
    reply(map);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [GET] /map/{id}/route/?orgin=A&dest=B&autonomy=10&gas=2.5
MapController.prototype.route = function (request, reply) {
  let id = request.params.id;

  this.model.findOneAsync({_id: id})
  .then((map) => {
    if (!map) {
      reply(Boom.notFound());
      return;
    }

    let roads = roadsToGraph(map.roads);
    let options = {
      roads: roads,
      origin: request.query.origin,
      destination: request.query.destination,
      autonomy: request.query.autonomy,
      gas: request.query.gas
    };

    let route = calculateCost(options);
    if (route.path === null) {
      reply(Boom.badRequest('Origin or Destination is invalid. Please try again with new data'));
      return;
    }

    reply(route);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [POST] /map
MapController.prototype.create = function (request, reply) {
  let payload = request.payload;

  this.model.createAsync(payload)
  .then((map) => {
    reply(map).code(202);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [PUT] /map/{id}
MapController.prototype.update = function (request, reply) {
  let id = request.params.id;
  let payload = request.payload;

  this.model.findOneAndUpdateAsync({_id: id}, payload, { new: true })
  .then((map) => {
    reply(map);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [DELETE] /map/{id}
MapController.prototype.destroy = function (request, reply) {
  let id = request.params.id;

  this.model.removeAsync({_id: id})
  .then(() => {
    reply();
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

module.exports = MapController;

/**
 *
 * CalculateCost will determine the best route and the cost using the Dijkstra Algorithm.
 * Cost inside bestRoute is the distance for the goal.
 * But we need calculate the real cost.
 * FORMULA: (km * gas) / autonomy
 * We need to get the product of kilometers multiplied by the price of gasoline
 * And finally the quotient of the product of the previous calculation for the autonomy of the vehicle
 *
 */
function calculateCost (options) {
  let roads = new Graph(options.roads);

  let bestRoute = roads.path(options.origin, options.destination, {cost: true});

  bestRoute.cost = (bestRoute.cost * options.gas) / options.autonomy;

  return bestRoute;
}

/**
 *
 * This function will get the roads in database and parse this in a Graph model
 * the Graph model will calculate the best route based on Dijkstra Algorithm.
 *
 */
function roadsToGraph (roads) {
  var parsed = {};
  _.map(roads, function (road) {
    if (_.isEmpty(parsed[road.origin])) {
      parsed[road.origin] = {};
    }
    parsed[road.origin][road.destination] = road.cost;
  });

  return parsed;
}
