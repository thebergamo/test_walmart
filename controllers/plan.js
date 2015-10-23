'use strict';

let _ = require('lodash');
let Boom = require('boom');
let Promise = require('bluebird');

function PlanController (db) {
  this.database = db;
  this.model = Promise.promisifyAll(db.Plan);
}

// [GET] /plan
PlanController.prototype.index = function (request, reply) {
  this.model.findAsync({})
  .then((plans) => {
    reply(plans);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [GET] /plan/{id}
PlanController.prototype.show = function (request, reply) {
  let id = request.params.id;

  this.model.findOneAsync({_id: id})
  .then((plan) => {
    if (!plan) {
      reply(Boom.notFound());
      return;
    }
    reply(plan);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [GET] /plan/{id}/query/?orgin=A&destination=B&minutes=10
PlanController.prototype.query = function (request, reply) {
  let self = this;
  let id = request.params.id;
  let priceModel = Promise.promisifyAll(this.database.Price);

  Promise
  .props({
    plan: getPlan(),
    price: getPrice()
  })
  .then((result) => {
    if (!result.plan) {
      reply(Boom.notFound('Plan not found!'));
      return;
    }

    if (!result.price) {
      reply(Boom.notFound('Origin is invalid. Please try again with new data'));
      return;
    }

    let destinationInfo = getDestination(result.price, request.query.destination);

    if (!destinationInfo) {
      reply(Boom.notFound('Destination is invalid for this Origin. Please try again with new data'));
      return;
    }

    let options = {
      plan: result.plan,
      origin: request.query.origin,
      destination: request.query.destination,
      minutes: request.query.minutes,
      destinationInfo: destinationInfo
    };

    let costs = calculateCost(options);

    reply(costs);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });

  function getPlan () {
    return self.model.findOneAsync({_id: id});
  }
  function getPrice () {
    return priceModel.findOneAsync({origin: request.query.origin});
  }
};

// [POST] /plan
PlanController.prototype.create = function (request, reply) {
  let payload = request.payload;

  this.model.createAsync(payload)
  .then((plan) => {
    reply(plan).code(202);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [PUT] /plan/{id}
PlanController.prototype.update = function (request, reply) {
  let id = request.params.id;
  let payload = request.payload;

  this.model.findOneAndUpdateAsync({_id: id}, payload, { new: true })
  .then((plan) => {
    reply(plan);
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

// [DELETE] /plan/{id}
PlanController.prototype.destroy = function (request, reply) {
  let id = request.params.id;

  this.model.removeAsync({_id: id})
  .then(() => {
    reply();
  })
  .catch((err) => {
    reply(Boom.badImplementation(err.message));
  });
};

module.exports = PlanController;

/*
 *
 * calculateCost will calculate the costs based in origin,
 * destination, minutes and the specified plan.
 * And return an object with:
 * Origin, Destination, Minutes, Plan, PlanCost, NoPlanCost
 *
 */
function calculateCost (options) {
  let pack = options.plan.pack;
  var ret = {
    origin: options.origin,
    destination: options.destination,
    minutes: options.minutes,
    plan: options.plan.name,
    planCost: 0
  };

  // if minutes is greater than the minutes in package
  // we need to calculing the minutes extra.
  if (options.minutes > pack.minutes) {
    let increase = options.destinationInfo.cost * (pack.extra / 100);
    let planCost = (options.minutes - pack.minutes) * (options.destinationInfo.cost + increase);
    ret['planCost'] = planCost;
  }
  // calculate the cost without a plan
  let noPlanCost = options.minutes * options.destinationInfo.cost;
  ret['noPlanCost'] = noPlanCost;

  return ret;
}

/*
 *
 * find in array of destination a match to the specified destination
 * And return the object
 *
 */
function getDestination (obj, destination) {
  return _.find(obj.destinations, {destination: destination});
}
