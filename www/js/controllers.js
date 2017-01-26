angular.module('fauzie.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('HomeCtrl', function($scope, $ionicNavBarDelegate, $timeout) {

  $scope.$on('$ionicView.enter', function() {
    $timeout(function() {
      $ionicNavBarDelegate.align('center');
    });
  });

})

.controller('GalleryCtrl', function($scope, $timeout, $ionicLoading, appGallery) {

  $scope.items = [];

  var parseGallery = function(items){
    var results = [];
    angular.forEach(items, function(item){
      results.push({
        sub: item.get('Title') + ' (' + item.get('Year') + ')',
        src: item.get('Image').url()
      });
    });
    return results;
  };

  $ionicLoading.show()
  .then(function(){
    appGallery.fetch()
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.items = parseGallery(_data), 0);
    });
  });

})

.controller('ProjectsCtrl', function($scope, $timeout, $ionicLoading, appProject) {
  
  $scope.projects = [];
  $scope.go = function ( path ) {
    $location.path( path );
  };

  var parseProjects = function(objs) {
    var results = objs.reduce(function (obj, pro) {
      obj[pro.id] = pro.attributes;
      return obj;
    }, {});
    return results;
  };

  $ionicLoading.show()
  .then(function(){
    appProject.fetch()
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.projects = parseProjects(_data), 0);
    });
  });

})

.controller('ProjectCtrl', function($scope, $stateParams, $timeout, $ionicLoading, appProject) {

  $scope.id = $stateParams.projectId;
  $scope.data = [];

  $ionicLoading.show()
  .then(function(){
    appProject.get($scope.id)
    .then(function(_data){
      console.log(_data.attributes);
      $ionicLoading.hide();
      $timeout($scope.data = _data.attributes, 0);
    });
  });
});
