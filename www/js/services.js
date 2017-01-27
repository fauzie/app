/**
 * Angular Factory Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

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

  var storage = window.localStorage.getItem('Project');
  var Project = Parse.Object.extend('Project');
  var query = new Parse.Query(Project);
  query.descending('year');

  return {
    items: [],
    fetch: function() {
      var result = $q.defer();
      if (storage === null || JSON.parse(storage).length < 1) {
        query.find().then(
        function (projects) {
          this.items = projects.reduce(function (obj, pro) {
            obj[pro.id] = pro.attributes;
            return obj;
          }, {});
          window.localStorage.setItem('Project', JSON.stringify(this.items));
          result.resolve(this.items);
        },
        function(error) {
          result.reject(error);
        });
      } else {
        this.items = JSON.parse(storage);
        result.resolve(this.items);
      }
      return result.promise;
    },
    getData: function(obj) {
      if ( obj === null ) {
        return [];
      }
      var result = $q.defer();
      if (storage === null) {
        query.get(obj).then(
        function (pro) {
          result.resolve(pro.attributes);
        },
        function(error) {
          result.reject(error);
        });
      } else {
        var temp = JSON.parse(storage);
        if ( temp[obj] ) {
          var tempdata = temp[obj];
          result.resolve( tempdata );
        } else {
          result.reject();
        }
      }
      return result.promise;
    }
  }

})