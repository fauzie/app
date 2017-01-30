/**
 * Angular Controller Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicAuth, $ionicUser, $timeout) {

  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.isLoading = false;

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
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $scope.loginData = $scope.loginData || {};
    $scope.isLoading = true;
    // $ionicAuth.login('basic', $scope.loginData).then(function(){
    //   $scope.closeLogin();
    // });
    
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

.controller('ServicesCtrl', function($scope, $timeout, $ionicDB, $ionicAuth, $ionicUser, $ionicLoading, appParse) {

  $scope.services = [];

  $ionicDB.connect();
  var services = $ionicDB.collection('services');

  var details = {
    'name': 'Tester User',
    'username': 'tester',
    'email': 'hello@fauzie.my.id',
    'password': 'bla123bla',
    'image': 'http://res.cloudinary.com/fauzie/image/upload/personal/fauzie-ava.jpg',
    'quotes': 0
  };

  // $ionicAuth.signup(details).then(function() {
  //   return $ionicAuth.login('basic', {'email': 'hello@fauzie.my.id', 'password': 'bla123bla'}).then(function(){
  //     console.log($ionicUser)
  //   });
  // });

  $ionicLoading.show()
  .then(function(){
    services.order('order').fetch().subscribe(
      function(docs){ 
        $ionicLoading.hide();
        $timeout($scope.services = docs, 0);
      },
      function(err) { console.error(err) }
    );
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
