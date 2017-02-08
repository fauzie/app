/**
 * Angular Main App Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie', [
  'ionic',
  'ion-gallery',
  'firebase',
  'ngCordova',
  'fauzie.controllers',
  'fauzie.services'
])

.run(function($rootScope, $state, $ionicPlatform, $ionicPopup, $ionicHistory) {

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

    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
      if ($state.current.name == "app.home") {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Exit Fauzie App',
          template: 'Are you sure want to exit app?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            window.localStorage.clear();
            navigator.app.exitApp();
          }
        });
      } else {
        $ionicHistory.nextViewOptions({ disableBack: true });
        $state.go('app.home');
      }
    }, 800);

    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
      if (error === "AUTH_REQUIRED") {
        $state.go('app.home');
      }
    });

  });
})

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(1);
  $ionicConfigProvider.views.transition('ios');
  $ionicConfigProvider.tabs.style('striped');
  $ionicConfigProvider.tabs.position('bottom');
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
  })

  // member Area
  .state('app.client', {
    url: '/client',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/tabs.html',
        controller: 'ClientCtrl'
      }
    }
  })

  .state('app.client.dashboard', {
    url: '/dashboard',
    views: {
      'client-dashboard': {
        templateUrl: 'templates/client/dashboard.html',
        //controller: 'ClientDashboardCtrl'
      }
    }
  })

  .state('app.client.quotes', {
    url: '/quotes',
    views: {
      'client-quotes': {
        templateUrl: 'templates/client/quotes.html',
        //controller: 'ClientDashboardCtrl'
      }
    }
  })
  
  .state('app.client.settings', {
    url: '/settings',
    views: {
      'client-settings': {
        templateUrl: 'templates/client/settings.html',
        controller: 'ClientSettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
})

.directive('backgroundImageSrc', function () {
  return function (scope, element, attrs) {
    var src = attrs.backgroundImageSrc || false;
    if (src) {
      element.css({
        'background-image': 'url(' + attrs.backgroundImageSrc + ')'
      });
    }
  };
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

.directive('formValidate', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      var validateClass = 'form-validate';
      ctrl.validate = false;
      element.bind('focus', function (evt) {
        if (ctrl.validate && ctrl.$invalid) {
          element.addClass(validateClass);
          scope.$apply(function () { ctrl.validate = true; });
        } else {
          element.removeClass(validateClass);
          scope.$apply(function () { ctrl.validate = false; });
        }
      }).bind('blur', function (evt) {
        element.addClass(validateClass);
        scope.$apply(function () { ctrl.validate = true; });
      });
    }
  };
})

.filter('getDomain', function () {
  return function (url) {
    if (url === undefined) return;
    var result = url.toString();
    return result.length ? result.replace('http://','').replace('www.','').split(/[/?#]/)[0] : '';
  };
});