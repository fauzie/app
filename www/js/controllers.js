/**
 * Angular Controller Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

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

.controller('GalleryCtrl', function($scope, $timeout, $ionicLoading, appParse) {

  $scope.items = [];

  var parseGallery = function(items){
    var results = [];
    angular.forEach(items, function(item){
      results.push({
        sub: item.Title + ' (' + item.Year + ')',
        src: item.Image.url
      });
    });
    return results;
  };

  $ionicLoading.show()
  .then(function(){
    appParse.fetch('Gallery', 'Year', 'ASC')
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.items = parseGallery(_data), 0);
    });
  });

})

.controller('ExpsCtrl', function($scope, $timeout, $ionicLoading, appParse) {

  $scope.exps = [];

  $ionicLoading.show()
  .then(function(){
    appParse.fetch('Experience', 'index', 'ASC')
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.exps = _data, 0);
    });
  });

})

.controller('SkillsCtrl', function($scope, $timeout, $ionicLoading, appParse) {

  $scope.skills = [];

  $ionicLoading.show()
  .then(function(){
    appParse.fetch('Skill', 'type', 'DESC')
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.skills = _data, 0);
    });
  });

  $scope.dividerFunction = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

})

.controller('ServicesCtrl', function($scope, $timeout, $ionicLoading, appParse) {

  $scope.services = [];

  $ionicLoading.show()
  .then(function(){
    appParse.fetch('Service', 'order', 'ASC')
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.services = _data, 0);
    });
  });

})

.controller('ProjectsCtrl', function($scope, $timeout, $ionicLoading, appParse) {

  $scope.projects = [];

  $ionicLoading.show()
  .then(function(){
    appParse.fetch('Project', 'year', 'DESC')
    .then(function(_data){
      $ionicLoading.hide();
      $timeout($scope.projects = _data, 0);
    });
  });

})

.controller('ProjectCtrl', function($scope, $timeout, $stateParams, $ionicLoading, $cordovaSocialSharing, appParse) {

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
    appParse.get($scope.id, 'Project')
    .then(function(item){
      $ionicLoading.hide();
      $timeout($scope.data = item, 0);
    });
  });

});
