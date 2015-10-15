var request = require('request'),
    async = require('async'),
    jsonfile = require('jsonfile'),
    _ = require('lodash'),
    path = require('path');

var concurrency = 4;
var api = 'http://api.pouet.net/v1';
var visited = {};

module.exports = {};

function error(){
   console.error.apply(null, ['error'].concat(arguments));
}

var queue = async.queue(function crawl(path, next){
   request(path, function(err, response, body){
      if ( err ) {
         return next(err, null);
      }
      visited[path] = body;
      return next(null, body);
   });
}, concurrency);

function appendTask(path, callback){
   if ( visited[path] ) {
      console.log('Already visited, exiting chain', path);
      callback(null, visited[path]); // Just return what we got
   } else {
      console.log(path);
      queue.push(path, callback);
   }
}

function jsonQuery(queryStr, callback){
   appendTask(api + queryStr, function(err, result){
      var responseObj = {};
      try {
         responseObj = JSON.parse(result);
      } catch (e) {
         return callback(e, null);
      }
      return callback(null, responseObj);
   });
}

function queryAndAppend(collection, query, callback){
   jsonQuery(query, function(err, result){
      if ( err || result.error ) {
         error('queryAndAppend', query, err ? err : result.error);
      } else {
         collection.push(result);
         console.log('Got result for query %s (collection size: %s)', query, collection.length);
      }
      return callback(err, result);
   });
}
module.exports.queryAndAppend = queryAndAppend;

function queryAndReturn(query, callback){
   jsonQuery(query, function(err, result){
      if ( err || result.error ) {
         error('queryAndAppend', query, err ? err : result.error);
      } else {
         console.log('Got result for query %s', query);
      }
      return callback(err, result);
   });
}
module.exports.queryAndReturn = queryAndReturn;

function saveData(filename, collection){
   jsonfile.writeFileSync(path.join(__dirname, '..', 'data', filename), collection, {spaces: 3});
}
module.exports.saveData = saveData;
