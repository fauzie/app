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
    fetch: function() {
      query.find().then(
      function (projects) {
        result.resolve(projects);
      },
      function(error) {
        result.reject(error);
      });
      return result.promise;
    },
    get: function(obj) {
      query.get(obj).then(
      function (projects) {
        result.resolve(projects);
      },
      function(error) {
        result.reject(error);
      });
      return result.promise;
    }
  }

})