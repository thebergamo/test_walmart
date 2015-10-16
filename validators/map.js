'use strict';

// load deps
let Joi = require('joi');

let MapValidator = {
  index: index,
  show: show,
  route: route,
  create: create,
  update: update,
  destroy: destroy
};

module.exports = MapValidator;

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

function route () {
  return {
    params: {
      id: Joi
        .string()
        .alphanum()
        .regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, '_id')
        .required()
    },
    query: {
      origin: Joi
        .string()
        .min(1)
        .max(30)
        .trim()
        .required(),
      destination: Joi
        .string()
        .min(1)
        .max(30)
        .trim()
        .required(),
      autonomy: Joi
        .number()
        .positive()
        .required(),
      gas: Joi
        .number()
        .positive()
        .required()
    }
  };
}

function create () {
  return {
    payload: {
      name: Joi
        .string()
        .min(1)
        .max(30)
        .trim()
        .required(),
      roads: Joi
        .array()
        .required()
        .min(1)
        .items(
          Joi
          .object({
            origin: Joi
              .string()
              .min(1)
              .max(30)
              .trim()
              .required(),
            destination: Joi
              .string()
              .min(1)
              .max(30)
              .trim()
              .required(),
            cost: Joi
              .number()
              .integer()
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
      name: Joi
        .string()
        .min(1)
        .max(30)
        .trim()
        .optional(),
      roads: Joi
        .array()
        .optional()
        .min(1)
        .items(
          Joi
          .object({
            origin: Joi
              .string()
              .min(1)
              .max(30)
              .trim()
              .required(),
            destination: Joi
              .string()
              .min(1)
              .max(30)
              .trim()
              .required(),
            cost: Joi
              .number()
              .integer()
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
