const Steady = require('steady-api').Steady;
const logger = require('morgan');
const express = require('express');

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Analytics API',
  middleware: [
    logger('dev'),
    express.static('images')
  ]
});