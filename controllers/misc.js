const Config = require('../lib/config');
const config = new Config('custom');
const async = require('async');

// return available groups
const groups = (params, callback) => {
  if (params.verbose === false) return callback(null, config.getAvailableGroups());
  return callback(null, config.getAvailableGroupsVerbose());
}


module.exports = {
  groups
}