var util = require('./util.js');
var db = require('../db/config.js');
var config = require('../../config.js');
var AWS = require('aws-sdk');
var EC2 = require('ec2-event');
var _ = require('underscore');
var Q = require('q');

var awsConfig = {
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey,
  region: "us-east-1"
};

_.defaults(AWS.config, awsConfig);


var endHandler = function(req, res) {
  /*
    Handler for the POST received from the EC2 instance notifying of a finished
    process.

    1. Receives data with instanceId, repo endpoint, commit
    2. Verifies commit has been pushed to local git
    2. Adds completed and completeCommit to db
    3. Terminates instance

    arguments:
    req, res
    req.body is an object with { instanceId, repo endpoint, completeCommit }
   */

  validateResult(req.body)
    .catch(function(e) {
      res.send(400, e.message);
      throw e;
    })
    .then(dbWrite)
    .then(function(data) {
      res.send(201, 'Terminating');
      return data;
    })
    .then(terminateInstance)
    .catch(util.error);

};

var validateResult = function(obj) {
  var deferred = Q.defer();

  util.currentCommit(obj.endpoint)
    .then(function(commit) {
      if (commit.id !== obj.completeCommit) {
        var err = new Error("Results haven't been pushed to the git repo");
        deferred.reject(err);
      } else {
        deferred.resolve(obj);
      }
    });

  return deferred.promise;
};

var dbWrite = function(obj) {
  var deferred = Q.defer();
  var query = { instanceId: obj.instanceId };
  db.RunLog.find(query, function(err, docs) {
    if (err) {
      deferred.reject(new Error(err));
    } else if (docs.length !== 1) {
      err = "Multiple docs returned when looking up by instanceId";
      deferred.reject(new Error(err));
    } else {
      var doc = docs[0];
      if (doc.completed && doc.completeCommit) {
        // if results have already been recorded there's
        // no need to add them again
        deferred.resolve(obj);
      }
      doc.completed = new Date();
      doc.completeCommit = obj.completeCommit;
      doc.code = obj.code;
      doc.save(function(err) {
        if (err) {
          deferred.reject(new Error(err));
        } else {
          deferred.resolve(obj);
        }
      });
    }
  });

  return deferred.promise;
};

var terminateInstance = function(obj) {
  var ec2 = new EC2();
  ec2.instanceIds.push(obj.instanceId);
  ec2.terminate();
};

module.exports = endHandler;
