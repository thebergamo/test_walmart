'use strict';

// load deps
let Joi = require('joi');

let PlanValidator = {
  index: index,
  show: show,
  query: query,
  create: create,
  update: update,
  destroy: destroy
};

module.exports = PlanValidator;

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

function query () {
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
      minutes: Joi
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
      pack: Joi
        .object({
          minutes: Joi
          .number()
          .integer()
          .positive()
          .required(),
          extra: Joi
          .number()
          .integer()
          .positive()
          .required(),
          cost: Joi
          .number()
          .integer()
          .positive()
          .required()
        })
        .required()
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
      pack: Joi
        .object({
          minutes: Joi
            .number()
            .integer()
            .positive()
            .required(),
          extra: Joi
            .number()
            .integer()
            .positive()
            .required(),
          cost: Joi
            .number()
            .integer()
            .positive()
            .required()
        })
        .optional()
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
