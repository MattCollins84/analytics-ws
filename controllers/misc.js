const Config = require('../lib/config');
const config = new Config('custom');
const async = require('async');

// return available classes
const classes = (params, callback) => {
  return callback(null, config.getAvailableClasses());
}


module.exports = {
  classes
}