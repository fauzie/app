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

  return {
    items: [],
    userData: {},
    Auth: function () {
      return $firebaseAuth();
    },
    setDefaultUserData: function (userId) {
      var defer = $q.defer();
      var userRref = firebase.database().ref('users');
      var userData = $firebaseObject(userRref);
      userData[userId] = {
        firstname: '',
        lastname: '',
        email: '',
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
      var userData = $firebaseObject(userRref);

      userData.$loaded().then(function(data) {
        this.userData = data;
        defer.resolve(data);
      }).catch(function(error) {
        defer.reject(error);
      });
      return defer.promise;
    },
    setUserEmail: function (userObj, newEmail, reAuthPass) {

      var defer = $q.defer()
        , userData = userObj.$getAuth();

      if (userData.email == newEmail) {
        defer.resolve(userObj);
        return defer.promise;
      }

      var showReAuth = function (pass) {
        var credential = firebase.auth.EmailAuthProvider.credential(userData.email, pass);
        userObj.$signInWithCredential(credential)
        .then(function(fireUser) {
          userObj.$updateEmail(newEmail)
          .then(function () { defer.resolve(userObj) })
          .catch(function (error) {
            addPopup.alert('Email Update Failed', error);
            defer.reject();
          });
        })
        .catch(function(err) {
          addPopup.alert('Re-Auth Failed', err.message);
          defer.reject();
        });
      };

      addPopup.prompt({
        title: 'Password Check',
        cssClass: 'reauth-prompt',
        template: 'To change your primary email address, please re-enter your account password:',
        inputType: 'password',
        inputPlaceholder: 'Your password...'
      }).then(showReAuth)
      .catch(function(err) {
        addPopup.alert('Password Check Failed', err.message);
        defer.reject();
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
    }
  }
})

.factory('addPopup', function($ionicPopup, $timeout) {
  
  return {
    show: function(params) {
      return $ionicPopup.show(params);
    },
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
    prompt: function (params) {
      return $ionicPopup.prompt(params);
    }
  }

})

.provider('relativeDateFilter', function () {
  var self = this;
  self.conversions = {
    now: 1,
    second: 1000,
    minute: 60,
    hour: 60,
    day: 24
  };
  self.labelText = {
    now: 'now',
    before_second: {
      'one': '%n second ago',
      'more': '%n seconds ago'
    },
    before_minute: {
      'one': '%n minute ago',
      'more': '%n minutes ago'
    },
    before_hour: {
      'one': '%n hour ago',
      'more': '%n hours ago'
    },
    before_day: {
      'one': '%n day ago',
      'more': '%n days ago'
    },
    after_second: {
      'one': '%n second left',
      'more': '%n seconds left'
    },
    after_minute: {
      'one': '%n minute left',
      'more': '%n minutes left'
    },
    after_hour: {
      'one': '%n hour left',
      'more': '%n hours left'
    },
    after_day: {
      'one': '%n day left',
      'more': '%n days left'
    }
  };
  self.datePattern = 'yyyy-MM-dd';
  self.defaultFormat = function (unit_key, delta, relativeTime) {
    return unit_key === 'day' && delta > 0;
  };
  var getText = function (key) {
    var labelKey = key;
    return self.labelText[labelKey];
  }, localize = function (delta, unit_key) {
    if (unit_key !== 'now') {
      var prefix = 'before_';
      if (delta < 0) {
        prefix = 'after_';
      }
      unit_key = prefix + unit_key;
    }
    var label = getText(unit_key), unit = angular.isString(label) ? label : delta == 1 ? label.one : label.more;
    return unit.replace('%n', Math.abs(delta));
  };
  this.$get = [
    'dateFilter',
    function (dateFilter) {
      return function (date) {
        var now = new Date(), relativeTime = new Date(date), delta = now - relativeTime, unit_key = 'now', key;
        var conversions = self.conversions;
        for (key in conversions) {
          if (Math.abs(delta) < conversions[key]) {
            break;
          }
          unit_key = key;
          delta = delta / conversions[key];
        }
        if (self.defaultFormat(unit_key, delta, relativeTime)) {
          return dateFilter(relativeTime, self.datePattern);
        }
        return localize(Math.floor(delta), unit_key);
      };
    }
  ];
});