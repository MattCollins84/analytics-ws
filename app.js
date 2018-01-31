const Steady = require('steady-api').Steady;
const logger = require('morgan');
const express = require('express');
const Joi = require('joi');
const Config = require('./lib/config');
const config = new Config('custom');

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Analytics API',
  middleware: [
    logger('dev'),
    express.static('images')
  ],
  customTypes: [
    {
      name: "groups",
      validation: Joi.array().items(config.getAvailableGroups())
    },
    {
      name: "roi",
      validation: Joi.array().items(
        Joi.object().keys({
          x: Joi.number().required(),
          y: Joi.number().required(),
          h: Joi.number().required(),
          w: Joi.number().required(),
          matchingType: Joi.string().valid("intersect", "contains").required(),
          type: Joi.string().valid("box").required()
        })
      )
    }
  ]
});