var shared = require('./shared'),
    async = require('async');

function getParties(){
   var parties = [];
   var maximumPartyId = 1000;
   async.times(maximumPartyId, function(n, next){
      shared.queryAndAppend(parties, 'id='+(n+1), next);
   }, function(err, result){
      if ( err ) {
         console.error('getParties failed', err);
      } else {
         parties = _.pluck(parties, 'party');
         shared.saveData('getParties.json', parties);
         console.log('Done');
      }
   });
}

getParties();
