var shared = require('./shared'),
    async = require('async'),
    _ = require('lodash');

function getProdLinksForPartyYear(party, linkType, callback){
   var prodLinks = [];
   async.eachSeries(party.prods, function(prod, callback){
      shared.queryAndReturn('/prod?id='+prod.id, function(err, result){
         if ( err ) {
            console.log('getProdsForPartyYear %j', party, prod.id, err);
            return callback(err);
         } else {
            /*var link = _.result(_.find(result.prod.downloadLinks, function(item){ return linkType.test(item.type);}), 'link');
            if ( link ) {
               prodLinks.push({'id': prod.id, 'name': prod.name, 'link': link});
            }*/
            prodLinks.push({'id': prod.id, 'name': prod.name, 'link': result.prod.downloadLinks});
            return callback(err);
         }
      });
   }, function(err){
      return callback(err, prodLinks);
   });
}

function getLinksForParty(party, firstYear, lastYear, linkType, callback){
   var partyLinks = [];
   async.times(lastYear-firstYear, function(n, next){
      var currentYear = firstYear + n;
      shared.queryAndReturn('/party/?id='+party.id+'&year='+currentYear, function(err, partyYear){
         if ( err ) {
            console.log('getLinksForParty', party, err);
            return next();
         } else {
            var linkCount = Object.keys(partyYear.prods).length;
            if ( linkCount ) {
               console.log("party id %s, year %s, prod count %s", party.id, currentYear, Object.keys(partyYear.prods).length);
            }
            getProdLinksForPartyYear(partyYear, linkType, function(err, links){
               partyLinks.push({'year': currentYear, 'links': links});
               return next();
            });
         }
      });
   }, function(err){
      if ( err ) {
         console.error('getLinksForParty failed', err);
         return callback(err);
      } else {
         console.log('getLinksForParty done party id=%s name="%s"', party.id, party.name);
         return callback(err, partyLinks);
      }
   });
}

function getLinks(parties, firstYear, lastYear, linkTypePattern){
   async.eachSeries(parties, function(party, callback){
      getLinksForParty(party, firstYear, lastYear, linkTypePattern, function(err, partyLinks){
         if ( err ) {
            return callback(err);
         }
         shared.saveData(['party', party.id, firstYear, lastYear].join('-')+'.json', {'party': party, 'links': partyLinks});
         return callback(err);
      });
   }, function(err, result){
      if ( err ) {
         console.error('getLinks failed', err);
      } else {
         console.log('getLinks done');
      }
   });
}

var parties = require('../data/getParties.json');
getLinks(parties, 1995, 2015, /capped/i);

