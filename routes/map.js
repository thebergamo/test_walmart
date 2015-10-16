'use strict';

var Controller = require('../controllers/map');
var Validator = require('../validators/map');

exports.register = (server, options, next) => {
  // instantiate controller
  var controller = new Controller(options.database);

  server.bind(controller);
  server.route([
    {
      method: 'GET',
      path: '/maps',
      config: {
        handler: controller.index,
        validate: Validator.index()
      }
    },
    {
      method: 'GET',
      path: '/map/{id}',
      config: {
        handler: controller.show,
        validate: Validator.show()
      }
    },
    {
      method: 'GET',
      path: '/map/{id}/route',
      config: {
        handler: controller.route,
        validate: Validator.route()
      }
    },
    {
      method: 'POST',
      path: '/map',
      config: {
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/map/{id?}',
      config: {
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/map/{id?}',
      config: {
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'map-route',
  version: '1.0.0'
};
