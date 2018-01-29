const Config = require('../lib/config');
const config = new Config('custom');
const async = require('async');

// return available classes
const classes = (params, callback) => {
  if (params.verbose === false) return callback(null, config.getAvailableClasses());
  return callback(null, config.getAvailableClassesVerbose());
}


module.exports = {
  classes
}