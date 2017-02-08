/**
 * Angular Controller Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicModal, $timeout, addPopup, fireService) {

  // Form data for the login modal
  $scope.loginData  = {};
  $scope.isLoading  = false;
  $scope.isLoggedIn = false;
  $scope.authObj    = fireService.Auth();

  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      $scope.loginData = firebaseUser;
      $scope.isLoggedIn = true;
    } else {
      $scope.isLoggedIn = false;
    }
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $scope.isLoading = false;
  };

  // Open the login modal
  $scope.login = function() {
    if ($scope.isLoggedIn) {
      $state.go('app.client.dashboard');
    } else {
      $scope.modal.show();
    }
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    if ($scope.isLoggedIn) {
      $state.go('app.client.dashboard');
      return;
    }
    $scope.loginData = $scope.loginData || {"email":"","password":""};
    $scope.isLoading = true;
    $scope.authObj.$signInWithEmailAndPassword($scope.loginData.email, $scope.loginData.password).then(function(currentUser) {
      console.log("Signed in as:", currentUser.uid);
      $scope.closeLogin();
      $scope.isLoggedIn = true;
      $state.go('app.client.dashboard');
    }).catch(function(error) {
      $scope.isLoading = false;
      addPopup.alert('Login Failed', error);
    });
  };

  $scope.toggleMenu = function() {
    $scope.sideMenuController.toggleLeft();
  };
})

.controller('HomeCtrl', function($scope, $state, $ionicNavBarDelegate, $timeout) {

  $scope.about = function () {
    $state.go('app.about');
    window.location.reload();
  }

  $scope.logoclass = 'transparent';
  $scope.imgclass = 'transparent';
  $scope.$on('$ionicView.enter', function(){
    $timeout( function() { $ionicNavBarDelegate.align('center') }, 0 );
    $timeout( function() { $scope.logoclass = 'animated flipInX' }, 600 );
    $timeout( function() { $scope.imgclass = 'animated zoomIn' }, 900 );
  });

})

.controller('GalleryCtrl', function($scope, $timeout, $ionicLoading, addPopup, fireService) {

  $scope.items = [];

  var parseGallery = function(items){
    var results = [];
    angular.forEach(items, function(item){
      results.push({
        sub: item.title + ' (' + item.year + ')',
        thumb: item.thumb,
        src: item.image
      });
    });
    return results;
  };

  $ionicLoading.show()
  .then(function(){
    fireService.getData('gallery', 'year')
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout($scope.items = parseGallery(_data), 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

})

.controller('ExpsCtrl', function($scope, $timeout, $ionicLoading, fireService, addPopup) {

  $scope.exps = [];

  $ionicLoading.show()
  .then(function(){
    fireService.getData('experiences', 'date', 'DESC')
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout($scope.exps = _data, 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

})

.controller('SkillsCtrl', function($scope, $timeout, $ionicLoading, fireService, addPopup) {

  $scope.skills = [];

  $ionicLoading.show()
  .then(function(){
    fireService.getData('skills', 'type', 'DESC')
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout($scope.skills = _data, 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

  $scope.dividerFunction = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

})

.controller('ServicesCtrl', function($scope, $timeout, $ionicLoading, fireService, addPopup) {

  $scope.services = [];

  $ionicLoading.show()
  .then(function(){
    fireService.getData('services', 'priority', 'DESC')
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout($scope.services = _data, 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

})

.controller('ProjectsCtrl', function($scope, $timeout, $ionicLoading, fireService, addPopup) {

  $scope.projects = [];

  $ionicLoading.show()
  .then(function(){
    fireService.getData('projects', 'year', 'DESC')
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout($scope.projects = _data, 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

})

.controller('ProjectCtrl', function($scope, $timeout, $stateParams, $ionicLoading, $cordovaSocialSharing, fireService, addPopup) {

  $scope.data = [];
  $scope.id = $stateParams.projectId;

  // Visit Project Site
  $scope.preview = function(){
    if ($scope.data.length > 1) return false;
    if ($scope.data.url == '') return false;
    window.open($scope.data.url, '_blank', 'location=no');
    return false;
  }

  // share project
  $scope.share = function(){
    if ($scope.data.length > 1) return false;
    var message = $scope.data.name +' is a '+ $scope.data.dat +' project developed by fauzie at '+ $scope.data.year+'.';
    $cordovaSocialSharing.share(message, 'Project '+$scope.data.name, null, $scope.data.url).finally(function(){
      return false;
    });
  }

  $ionicLoading.show()
  .then(function(){
    fireService.getItem('projects', $scope.id)
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout($scope.data = _data, 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

})

.controller('ClientCtrl', function ($scope, $state, $timeout, $ionicLoading, $ionicPopup, addPopup, fireService) {

  /**
   * Client Area
   ============================================================ */

  $scope.user = {};
  $scope.authObj = fireService.Auth();
  $scope.proPic = 'img/user_profile.png';
  $scope.hasProPic = false;

  $ionicLoading.show();
  
  $scope.authObj.$onAuthStateChanged(function (user) {
    if (!user) {
      $scope.user = {};
      $state.go('app.home');
      return true;
    }

    if (user.photoURL !== null && user.photoURL.length) {
      $scope.proPic = user.photoURL;
      $scope.hasProPic = true;
    }

    fireService.isUserDataExists(user.uid)
    .then(function (check) {
      if (check) {
        var extraData = fireService.getUserData(user.uid);
      } else {
        var extraData = fireService.setDefaultUserData(user.uid);
      }
      extraData.then(function(_data) {
        $ionicLoading.hide();
        user.extraData = _data;
        $timeout($scope.user = user, 0);
      });
    })
    .catch(function(err) {
      $ionicLoading.hide();
      console.error('Error', err);
      addPopup.alert('Something Wrong!',
        'Please check your internet connection before continue.');
    });

  });

})

.controller('ClientSettingsCtrl', function ($scope, $state, $q, $timeout, $ionicLoading, $ionicModal, addPopup, fireService) {

  $scope.isSaving = false;
  $scope.saveClss = 'inner-default';
  $scope.password = { old: '', new: '', confirm: '' };
  $timeout($scope.editData = $scope.user.extraData, 0);

  $scope.saveAccounts = function () {
    $scope.isSaving = true;
    $scope.saveClss = 'inner-saving';
    var displayName = $scope.editData.firstname + ' ' + $scope.editData.lastname;

    $q.all([
      fireService.setUserEmail($scope.authObj, $scope.editData.email, $scope.reAuthPass),
      $scope.user.updateProfile({ displayName: displayName }),
    ]).then(function() {
      $scope.editData.updated = new Date().toISOString();
      $scope.editData.$save();
    })
    .finally(function() {
      $timeout(function() {
        $scope.editData.email = $scope.user.email;
        $scope.user.extraData = $scope.editData;
        $scope.isSaving = false;
        $scope.saveClss = 'inner-saved';
      }, 0);
      $timeout(function () { $scope.saveClss = 'inner-default' }, 3000);
    });
  };

  $scope.savePassword = function () {
    $scope.isSaving = true;
    $scope.saveClss = 'inner-saving';

    var credential = firebase.auth.EmailAuthProvider.credential($scope.user.email, $scope.password.old);
    var loadChange = $scope.authObj.$signInWithCredential(credential)
    .then(function(fireUser) {
      $scope.authObj.$updatePassword($scope.password.new)
      .then(function () {
        $scope.saveClss = 'inner-saved';
        $timeout($scope.hidePassword, 900);
      })
      .catch(function (error) {
        $scope.saveClss = 'inner-default';
        addPopup.alert('Change Password Failed', error);
      })
      .finally(function () {
        $scope.isSaving = false;
      });
    })
    .catch(function(err) {
      $scope.isSaving = false;
      $scope.saveClss = 'inner-default';
      addPopup.alert('Change Password Failed', err);
    });

    return loadChange;
  };

  $ionicModal.fromTemplateUrl('templates/client/password.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.passModal = modal;
  });

  $scope.showPassword = function() {
    $scope.passModal.show();
  };

  $scope.hidePassword = function () {
    $scope.passModal.hide();
    $scope.isSaving = false;
    $scope.saveClss = 'inner-default';
  };

});