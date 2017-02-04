/**
 * Angular Factory Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.services', [])

.factory('fireService', function($q, $firebaseAuth, $firebaseStorage, $firebaseArray, $firebaseObject, $cordovaDevice, addPopup) {

  var deviceID = (typeof window.device === 'undefined') ? 'Browser' : $cordovaDevice.getUUID();

  var User = $firebaseObject.$extend({
    getCreated: function() {
      return new Date(this.created).toLocaleString();
    },
    getupdated: function() {
      return new Date(this.updated).toLocaleString();
    }
  });

  return {
    items: [],
    Auth: function () {
      return $firebaseAuth();
    },
    setDefaultUserData: function (userId) {
      var defer = $q.defer();
      var userRref = firebase.database().ref('users');
      var userData = $firebaseObject(userRref);
      userData[userId] = {
        quotes: [0],
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      userData.$save().then(function (ref) {
        defer.resolve(userData[userId]);
      }).catch(function (err) {
        defer.reject(err);
      });
      return defer.promise;
    },
    isUserDataExists: function (userId) {
      var userRref = firebase.database().ref('users').child(userId);
      return userRref.once('value').then(function (snapshot) {
        return snapshot.exists();
      });
    },
    getUserData: function (userId) {
      var defer = $q.defer();
      var userRref = firebase.database().ref('users').child(userId);
      var userData = new User(userRref);

      userData.$loaded().then(function(data) {
        defer.resolve(data);
      }).catch(function(error) {
        defer.reject(error);
      });
      return defer.promise;
    },
    setUserData: function (userData) {
      
      if (!angular.isObject(userData)) {
        userData = {};
      }

      var defer = $q.defer()
      , userAuth = $firebaseAuth().$getAuth()
      , currentUserData;

      if (!userAuth) {
        addPopup.alert('Update Failed', 'Please login before continue.');
        defer.reject();
        return defer.promise;
      }

      currentUserData = this.getUserData(userAuth.uid);

      if (currentUserData.length < 1 || userData.length < 1) {
        currentUserData.quotes = [];
        currentUserData.created = new Date().toISOString();
        currentUserData.updated = new Date().toISOString();
      } else {
        currentUserData = angular.merge(currentUserData, userData);
      }
      
      currentUserData.$save().then(function(ref) {
        if (ref.key == currentUserData.$id) {
          var newData = this.getUserData(userAuth.uid);
          defer.resolve(newData);
        } else {
          defer.reject();
        }
      });

      return defer.promise;
    },
    getData: function (data, order, sort) {
      order = order || null;
      sort = sort || 'ASC';
      var results = $q.defer();
      var ref = firebase.database().ref('site');
      var query = ref.child(data).orderByChild(order);
      var objkey  = deviceID + '|' + ([data,order,sort]).toString();
      var storage = JSON.parse(window.localStorage.getItem(objkey));

      if ( storage !== null && storage.length > 1 ) {
        this.items = storage;
        results.resolve(this.items);
        return results.promise;
      }

      if (order !== null && sort == 'ASC') {
        query.limitToLast(100);
      } else {
        query.limitToFirst(100);
      }
      var response = $firebaseArray(query);
      response.$loaded(function(data){
        window.localStorage.setItem(objkey, JSON.stringify(data));
        this.items = data;
        results.resolve(data);
      }, function(err){
        results.reject(err);
      });
      return results.promise;
    },
    getItem: function(obj, itemId) {

      var results = $q.defer();

      if (obj === null || itemId === null) {
        results.reject();
        return results.promise;
      }

      angular.forEach(this.items, function(item) {
        if (item.$id == itemId) {
          results.resolve(item);
          return results.promise;
        }
      });

      var ref = firebase.database().ref('site/'+obj+'/'+itemId);
      var query = $firebaseObject(ref);

      query.$loaded(function(data) {
        results.resolve(data);
      }, function(err) {
        results.reject(err);
      });
      return results.promise;
    },
    user: function(userId) {
      var userRef = firebase.database().ref().child("users").child(userId);
      return new User(userRef);
    }
  }
})

.factory('addPopup', function($ionicPopup, $timeout) {
  
  return {
    alert: function(title, content) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: '<div class="text-center">'+content+'</div>'
      });
      return alertPopup;
    },
    confirm: function(title, content) {
      var confirmPopup = $ionicPopup.confirm({
        title: title,
        template: '<div class="text-center">'+content+'</div>'
      });
      return confirmPopup;
    },
    prompt: function(title, content, input, placeholder) {
      var promptPopup = $ionicPopup.prompt({
        title: title,
        template: '<div class="text-center">'+content+'</div>',
        inputType: input || 'text',
        inputPlaceholder: placeholder || ''
      });
      return promptPopup;
    }
  }

});