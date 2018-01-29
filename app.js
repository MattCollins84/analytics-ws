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
      name: "classes",
      validation: Joi.array().items(config.getAvailableClasses())
    }
  ]
});