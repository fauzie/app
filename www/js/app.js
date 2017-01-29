/**
 * Angular Main App Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie', ['ionic', 'ion-gallery', 'ngCordova', 'fauzie.controllers', 'fauzie.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      // Replace window open
      window.open = cordova.InAppBrowser.open;
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  // Parse server configuration
  Parse.initialize('BdMzY3vrrS9UBbiDTLosrtFqK51RgiLW6vWVBMt0', '5aUFXETc530I9J0SuEAvK00tzF3PDMatooJIqYbq');
  Parse.serverURL = 'https://parseapi.back4app.com/';
})

.config(function(ionGalleryConfigProvider) {
  ionGalleryConfigProvider.setGalleryConfig({
    action_label: '',
    template_gallery: 'templates/gallery/view.html',
    template_slider: 'templates/gallery/slider.html',
    toggle: true,
    row_size: 2,
    fixed_row_size: true
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html'
      }
    }
  })

  .state('app.gallery', {
    url: '/gallery',
    views: {
      'menuContent': {
        templateUrl: 'templates/gallery.html',
        controller: 'GalleryCtrl'
      }
    }
  })

  .state('app.exps', {
    url: '/exps',
    views: {
      'menuContent': {
        templateUrl: 'templates/exps.html',
        controller: 'ExpsCtrl'
      }
    }
  })

  .state('app.skills', {
    url: '/skills',
    views: {
      'menuContent': {
        templateUrl: 'templates/skills.html',
        controller: 'SkillsCtrl'
      }
    }
  })

  .state('app.services', {
    url: '/services',
    views: {
      'menuContent': {
        templateUrl: 'templates/services.html',
        controller: 'ServicesCtrl'
      }
    }
  })

  .state('app.projects', {
    url: '/projects',
    views: {
      'menuContent': {
        templateUrl: 'templates/projects.html',
        controller: 'ProjectsCtrl'
      }
    }
  })

  .state('app.project', {
    url: '/project/:projectId',
    views: {
      'menuContent': {
        templateUrl: 'templates/project.html',
        controller: 'ProjectCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
})

.directive('autoDivider', function($timeout) {  
	var lastDivideKey = "";

	return {
		link: function(scope, element, attrs) {
			var key = attrs.autoDividerValue;

			var defaultDivideFunction = function(k){
				return k.slice( 0, 1 ).toUpperCase();
			}
      
			var doDivide = function(){
				var divideFunction = scope.$apply(attrs.autoDividerFunction) || defaultDivideFunction;
				var divideKey = divideFunction(key);
				
				if(divideKey != lastDivideKey) {
					var contentTr = angular.element("<ion-item class='item item-divider'>"+divideKey+"</ion-item>");
					element[0].parentNode.insertBefore(contentTr[0], element[0]);
				}
				lastDivideKey = divideKey;
			}

			$timeout(doDivide,0);
		}
	}
})

.filter('cloudImageURL', function () {
  return function (img) {
    if (img === undefined) return;
    var result = img.toString();
    return result.length ? 'http://res.cloudinary.com/fauzie/image/upload/'+result : '';
  };
})

.filter('getDomain', function () {
  return function (url) {
    if (url === undefined) return;
    var result = url.toString();
    return result.length ? result.replace('http://','').replace('www.','').split(/[/?#]/)[0] : '';
  };
});