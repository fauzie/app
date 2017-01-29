/**
 * Angular Factory Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.services', [])

.factory('appParse', function($q, $cordovaDevice) {

  var deviceID = (typeof window.device === 'undefined') ? 'Browser' : $cordovaDevice.getUUID();

  return {
    items: [],
    fetch: function(obj, sort, order) {
      
      obj   = obj || null;
      sort  = sort || null;
      order = order || 'ASC';

      var result  = $q.defer();
      var Object  = Parse.Object.extend(obj);
      var query   = new Parse.Query(Object);
      var objkey  = deviceID + '/' + obj;
      var storage = JSON.parse(window.localStorage.getItem(objkey));

      if ( obj === null ) {
        return this.items;
      }

      if ( sort !== null ) {
        if ( order == 'ASC' ) {
          query.ascending(sort);
        } else if ( order == 'DESC' ) {
          query.descending(sort);
        }
      }

      if (this.items.length > 1) {
        result.resolve(this.items);
      }
      else if (storage === null || storage.length < 2) {
        query.find().then(
        function (response) {
          this.items = response.reduce(function (item, key) {
            item[key.id] = key.attributes;
            return item;
          }, {});
          window.localStorage.setItem(objkey, JSON.stringify(this.items));
          result.resolve(this.items);
        },
        function(error) {
          result.reject(error);
        });
      } else {
        this.items = storage;
        result.resolve(this.items);
      }
      return result.promise;
    },
    get: function(obj, group) {
      if ( obj === null || group === null ) {
        return [];
      }
      var result  = $q.defer();
      var Object  = Parse.Object.extend(group);
      var query   = new Parse.Query(Object);
      var objkey  = deviceID + '/' + group;
      var storage = JSON.parse(window.localStorage.getItem(objkey));

      if (storage === null || storage.length < 2) {
        query.get(obj).then(
        function (item) {
          result.resolve(item.attributes);
        },
        function(error) {
          result.reject(error);
        });
      } else {
        if ( storage[obj] ) {
          result.resolve( storage[obj] );
        } else {
          result.reject();
        }
      }
      return result.promise;
    }
  }

})