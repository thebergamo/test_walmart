'use strict';

// load deps
let Joi = require('joi');

let PriceValidator = {
  index: index,
  show: show,
  create: create,
  update: update,
  destroy: destroy
};

module.exports = PriceValidator;

function index () {
  return {};
}

function show () {
  return {
    params: {
      id: Joi
        .string()
        .alphanum()
        .regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, '_id')
        .required()
    }
  };
}

function create () {
  return {
    payload: {
      origin: Joi
        .string()
        .min(1)
        .max(30)
        .trim()
        .required(),
      destinations: Joi
        .array()
        .required()
        .min(1)
        .items(
          Joi
          .object({
            destination: Joi
              .string()
              .min(1)
              .max(30)
              .trim()
              .required(),
            cost: Joi
              .number()
              .positive()
              .required()
          })
        )
    }
  };
}

function update () {
  return {
    params: {
      id: Joi
        .string()
        .alphanum()
        .regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, '_id')
        .required()
    },
    payload: {
      origin: Joi
        .string()
        .min(1)
        .max(30)
        .trim()
        .optional(),
      destinations: Joi
        .array()
        .optional()
        .min(1)
        .items(
          Joi
          .object({
            destination: Joi
              .string()
              .min(1)
              .max(30)
              .trim()
              .required(),
            cost: Joi
              .number()
              .positive()
              .required()
          })
        )
    }
  };
}

function destroy () {
  return {
    params: {
      id: Joi
        .string()
        .alphanum()
        .regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, '_id')
        .required()
    }
  };
}
