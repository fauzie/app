/**
 * Angular Factory Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.services', [])

.factory('fireService', function($q, $firebaseAuth, $firebaseStorage, $firebaseArray, $firebaseObject, addPopup) {

  return {
    items: [],
    userData: {},
    Auth: function () {
      return $firebaseAuth();
    },
    setAdmin: function() {
      var storage = window.localStorage.getItem('fauzieapp.admin');

      if (storage !== null && storage.length) {
        return storage;
      }

      var admRef = firebase.database().ref('admin');
      var adminD = $firebaseObject(admRef);
      
      adminD.$loaded(function(admin) {
        window.localStorage.setItem('fauzieapp.admin', admin.$value);
      });
    },
    getAdmin: function() {
      return window.localStorage.getItem('fauzieapp.admin');
    },
    setUserData: function (userId, data) {
      var defer = $q.defer();
      var userRref = firebase.database().ref('users').child(userId);
      var userData = $firebaseObject(userRref);

      userData.$loaded().then(function() {
        angular.merge(userData, data);
        userData.$save().then(function (ref) {
          defer.resolve(userData);
        }).catch(function (err) {
          defer.reject(err.message);
        });
      });

      return defer.promise;
    },
    getUserData: function (userId) {
      var defer = $q.defer();
      var userRref = firebase.database().ref('users').child(userId);
      var userData = $firebaseObject(userRref);

      userData.$loaded().then(function(data) {
        this.userData = data;
        defer.resolve(data);
      }).catch(function(error) {
        defer.reject(error.message);
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
            defer.reject(error.message);
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
      var query = ref.child(data);
      var objkey  = 'site:' + data;
      var storage = JSON.parse(window.localStorage.getItem(objkey));

      if ( storage !== null && storage.length > 1 ) {
        this.items = storage;
        results.resolve(this.items);
        return results.promise;
      }
      if (order !== null) {
        query.orderByChild(order);
      }
      if (sort !== null && sort == 'ASC') {
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
        results.reject(err.message);
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
        results.reject(err.message);
      });
      return results.promise;
    },
    getQuotes: function(userId) {
      var q = $q.defer();
      var ref = firebase.database().ref('quotes').child(userId);
      var quotes = $firebaseObject(ref);

      quotes.$loaded(function(res) {
        q.resolve(res);
      }, function(err) {
        q.reject(err.message);
      });
      return q.promise;
    },
    getQuote: function(quoteId) {
      var q = $q.defer();
      var user  = $firebaseAuth().$getAuth().uid;
      var ref   = firebase.database().ref('quotes/'+user).child(quoteId);
      var quote = $firebaseObject(ref);

      quote.$loaded(function(res) {
        q.resolve(res);
      }, function(err) {
        q.reject(err.message);
      });
      return q.promise;
    },
    addQuote: function(userId, data) {
      var q = $q.defer();
      var ref = firebase.database().ref('quotes').child(userId);
      var quotes = $firebaseArray(ref);
      
      quotes.$add(data).then(function(ref) {
        q.resolve(ref.key);
      }).catch(function(err) {
        q.reject(err.message);
      });

      return q.promise;
    },
    setUserQuote: function(userId, quoteId) {
      var q = $q.defer();
      var ref = firebase.database().ref('users').child(userId);
      var userData = $firebaseObject(ref);

      userData.$loaded(function() {
        if (angular.isUndefined(userData.quotes)) {
          console.log('quotes is undefined');
          userData.quotes = [quoteId];
        } else {
          console.log('quotes push');
          userData.quotes.push(quoteId);
        }
        console.log('quotes', userData.quotes);
        userData.$save().then(function(ref) {
          q.resolve(ref.key);
        }).catch(function(err) {
          q.reject(err.message);
        });
      });

      return q.promise;
    },
    rmQuote: function(quoteId) {
      var q = $q.defer();
      var user  = $firebaseAuth().$getAuth().uid;
      var ref   = firebase.database().ref('quotes/'+user).child(quoteId);
      var msref = firebase.database().ref('messages/'+user).child(quoteId);
      var usref = firebase.database().ref('users/'+user).child('quotes');
      var quote = $firebaseObject(ref);
      var msg   = $firebaseObject(msref);
      var user  = $firebaseArray(usref);

      $q.all([ quote.$remove(), msg.$remove() ]).then(function(res) {
        user.$loaded(function() {
          var index = user.$getRecord(quoteId);
          user.$remove(index).then(function() {
            q.resolve(quoteId);
          });
        });
      }).catch(function(err) {
        q.reject(err.message);
      });
      return q.promise;
    },
    getUserAvatar: function(userId) {
      var storageRef = firebase.storage().ref('user/'+userId+'/avatar.jpg');
      return $firebaseStorage(storageRef);
    }
  }
})

.factory('fireChats', function($q, $firebaseAuth, $firebaseArray, $firebaseObject, addPopup) {

  var user = $firebaseAuth().$getAuth();
  var msgRef = firebase.database().ref('messages/'+user.uid);

  return {
    getMessages: function(quoteId) {
      var q = $q.defer();
      var query = msgRef.child(quoteId).orderByChild('time').limitToLast(20);
      var messages = $firebaseArray(query);

      messages.$loaded(function(msg) {
        q.resolve(msg);
      }, function(err) {
        q.reject(err.message);
      });
      return q.promise;
    },
    setLatest: function(msgId, quoteId) {
      var storageKey = user.uid+'--message--'+quoteId;
      window.localStorage.setItem(storageKey, msgId);
      return msgId;
    },
    getLatest: function(quoteId) {
      var storageKey = user.uid+'--message--'+quoteId;
      return window.localStorage.getItem(storageKey);
    }
  };

})

.factory('fireAdmin', function($q, $firebaseAuth, $firebaseArray, $firebaseObject) {

  var user = $firebaseAuth().$getAuth();

  return {
    get: function() {
      return window.localStorage.getItem('fauzieapp.admin');
    },
    getAll: function(rows) {
      var q = $q.defer();
      
      var ref = firebase.database().ref(rows);
      var obj = $firebaseObject(ref);
      
      obj.$loaded(function(){
        q.resolve(obj);
      }, function(err) {
        q.reject(err.message);
      });

      return q.promise;
    },
    getSite: function(posts) {
      var q = $q.defer();
      var ref = firebase.database().ref('site').child(posts);
      var query = $firebaseArray(ref);

      query.$loaded(function(postArray) {
        if (postArray.$resolved) {
          q.resolve(postArray);
        } else {
          q.reject('No internet connection.');
        }
      }, function(err) {
        q.reject(err.message);
      });

      return q.promise;
    }
  };

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

});