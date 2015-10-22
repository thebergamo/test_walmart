'use strict';

var Controller = require('../controllers/plan');
var Validator = require('../validators/plan');

exports.register = (server, options, next) => {
  // instantiate controller
  var controller = new Controller(options.database);

  server.bind(controller);
  server.route([
    {
      method: 'GET',
      path: '/plans',
      config: {
        handler: controller.index,
        validate: Validator.index()
      }
    },
    {
      method: 'GET',
      path: '/plan/{id}',
      config: {
        handler: controller.show,
        validate: Validator.show()
      }
    },
    {
      method: 'GET',
      path: '/plan/{id}/query',
      config: {
        handler: controller.query,
        validate: Validator.query()
      }
    },
    {
      method: 'POST',
      path: '/plan',
      config: {
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/plan/{id?}',
      config: {
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/plan/{id?}',
      config: {
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'plan-route',
  version: '1.0.0'
};
