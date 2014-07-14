var files = require('./files.js');
var config = require('./config.js');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp').ncp;
var git = require('gift');
var Q = require('q');

module.exports.error = error = function(err) {
  console.log(err);
  res.send(500);
  // send error code?
};

module.exports.clone = clone = function(dest, source) {
  var deferred = Q.defer();
  if (source === undefined) {
    source = config.bareRepo;
  }
  git.clone(source, dest, deferred.makeNodeResolver());
  return deferred.promise;
};

module.exports.cloneBare = function(dest) {
  var deferred = Q.defer();
  var mkdir = Q.denodeify(fs.mkdir);

  mkdir(path.dirname(dest))
    .catch(function(e) {
      if (e.errno === 47) {
        return;
      } else {
        error(e);
      }
    })
    .then(function() {
      ncp(config.bareRepo, dest, function(err) {
        if (err) {
          deferred.reject(new Error(err));
        } else {
          deferred.resolve(dest);
        }
      });
    })
    .catch(error);

  return deferred.promise;
};

module.exports.endpoint = function(file) {
  file = file.replace(/\.[^/.]+$/, '');
  return  ['http://' + config.host + ':' + config.port, file].join('/');
};

module.exports.validateObj = function(obj, properties) {
  for (var i = 0; i < properties.length; i++) {
    if (!obj.hasOwnProperty(properties[i])) {
      return false;
    }
  }
  return true;
};
