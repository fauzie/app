angular.module('fauzie.services', [])

.factory('appGallery', function($q) {

  var result = $q.defer();
  var Gallery = Parse.Object.extend('Gallery');
  var query = new Parse.Query(Gallery);

  return {
    fetch: function() {
      query.find().then(
      function (galleries) {
        result.resolve(galleries);
      },
      function(error) {
        result.reject(error);
      });
      return result.promise;
    }
  }

})

.factory('appProject', function($q) {

  var result = $q.defer();
  var Project = Parse.Object.extend('Project');
  var query = new Parse.Query(Project);
  query.descending('year');

  return {
    items: [],
    fetch: function() {
      query.find().then(
      function (projects) {
        this.items = projects.reduce(function (obj, pro) {
          obj[pro.id] = pro.attributes;
          return obj;
        }, {});
        result.resolve(this.items);
      },
      function(error) {
        result.reject(error);
      });
      return result.promise;
    },
    get: function(obj) {
      if (this.items.length) {
        this.items.forEach( function(pro) {
          if (pro.id == obj) result.resolve(pro.attributes);
        });
      } else {
        query.get(obj).then(
        function (pro) {
          result.resolve(pro.attributes);
        },
        function(error) {
          result.reject(error);
        });
      }
      return result.promise;
    }
  }

})