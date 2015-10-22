'use strict';

var Controller = require('../controllers/price');
var Validator = require('../validators/price');

exports.register = (server, options, next) => {
  // instantiate controller
  var controller = new Controller(options.database);

  server.bind(controller);
  server.route([
    {
      method: 'GET',
      path: '/prices',
      config: {
        handler: controller.index,
        validate: Validator.index()
      }
    },
    {
      method: 'GET',
      path: '/price/{id}',
      config: {
        handler: controller.show,
        validate: Validator.show()
      }
    },
    {
      method: 'POST',
      path: '/price',
      config: {
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/price/{id?}',
      config: {
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/price/{id?}',
      config: {
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'price-route',
  version: '1.0.0'
};
