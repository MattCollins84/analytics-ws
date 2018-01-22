const Steady = require('steady-api').Steady;
const logger = require('morgan');

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Analytics API',
  middleware: [
    logger('dev')
  ]
});