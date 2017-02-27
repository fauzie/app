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
  'angularMoment',
  'angular-inview',
  'checklist-model',
  'ionic-datepicker',
  'ionic-modal-select',
  'ionicResearchKit',
  'fauzie.controllers',
  'fauzie.services'
])

.run(function($rootScope, $ionicPlatform, $state, $ionicPopup, $ionicHistory) {

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

    document.addEventListener('backbutton', function(e) {
      if (parseInt(window.history.length) <= 2 ) {
        e.preventDefault();

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
        navigator.app.backHistory();
      }
    }, false);

  });

})

.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="crescent" class="spinner-positive"></ion-spinner><br><span>Please Wait...</span>'
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, ionGalleryConfigProvider, ionicDatePickerProvider) {

  $ionicConfigProvider.tabs.style('striped');
  $ionicConfigProvider.tabs.position('bottom');

  ionGalleryConfigProvider.setGalleryConfig({
    action_label: '',
    template_gallery: 'templates/gallery/view.html',
    template_slider: 'templates/gallery/slider.html',
    toggle: true,
    row_size: 2,
    fixed_row_size: true
  });

  ionicDatePickerProvider.configDatePicker({
    titleLabel: 'Select Date',
    mondayFirst: true,
    templateType: 'popup',
    showTodayButton: false
  });

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

  /*
   * MEMBER AREA
   */

  .state('app.client', {
    url: '/client',
    abstract: true,
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
        controller: 'ClientQuotesCtrl'
      }
    }
  })

  .state('app.client.quote', {
    url: '/quote/:quoteId',
    views: {
      'client-quotes': {
        templateUrl: 'templates/client/quote.html',
        controller: 'ClientQuoteCtrl'
      }
    }
  })

  .state('app.client.quotedit', {
    url: '/quotedit/:quoteId',
    views: {
      'client-quotes': {
        templateUrl: 'templates/client/quote-edit.html',
        controller: 'ClientQuoteCtrl'
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
  })
  
  /*
   * ADMIN AREA
   */

  .state('app.admin', {
    url: '/admin',
    abstract: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/admin/tabs.html',
        controller: 'AdminCtrl'
      }
    }
  })

  .state('app.admin.dashboard', {
    url: '/dashboard',
    views: {
      'admin-dashboard': {
        templateUrl: 'templates/admin/dashboard.html',
      }
    }
  })

  .state('app.admin.quotes', {
    url: '/quotes',
    views: {
      'admin-quotes': {
        templateUrl: 'templates/admin/quotes.html',
      }
    }
  })

  .state('app.admin.users', {
    url: '/users',
    views: {
      'admin-users': {
        templateUrl: 'templates/admin/users.html',
      }
    }
  })
  
  .state('app.admin.site', {
    url: '/site',
    views: {
      'admin-site': {
        templateUrl: 'templates/admin/site.html'
      }
    }
  })

  .state('app.admin.site.list', {
    url: '/:postType',
    cache: false,
    views: {
      'admin-site@app.admin': {
        templateUrl: 'templates/admin/site-list.html',
        controller: 'AdminPostListCtrl'
      }
    },
    resolve: {
      postType: function($stateParams) {
        return $stateParams.postType ? $stateParams.postType : '';
      }
    }
  })
  
  .state('app.admin.site.list.edit', {
    url: '/:postKey',
    cache: false,
    views: {
      'admin-site@app.admin': {
        templateUrl: 'templates/admin/site-edit.html',
        controller: 'AdminPostEditCtrl'
      }
    }
  })

  .state('app.admin.site.list.new', {
    url: '/new',
    cache: false,
    views: {
      'admin-site@app.admin': {
        templateUrl: 'templates/admin/site-new.html',
        controller: 'AdminPostNewCtrl'
      }
    }
  })
  ;

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

.directive('chatInput', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      'returnClose': '=',
      'onReturn': '&',
      'onFocus': '&',
      'onBlur': '&'
    },
    link: function(scope, element, attr) {
      element.bind('focus', function(e) {
        if (scope.onFocus) {
          $timeout(function() {
            scope.onFocus();
          });
        }
      });
      element.bind('blur', function(e) {
        if (scope.onBlur) {
          $timeout(function() {
            scope.onBlur();
          });
        }
      });
      element.bind('keydown', function(e) {
        if (e.which == 13) {
          if (scope.returnClose) element[0].blur();
          if (scope.onReturn) {
            $timeout(function() {
              scope.onReturn();
            });
          }
        }
      });
    }
  }
})

.directive('dateInput', function($filter, ionicDatePicker) {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      ngModel: '='
    },
    link: function(scope, element, attr, ngModelCtrl) {
      var newValue;
      var dateFormatView = (attr.dateInputView && attr.dateInputView.length) ? attr.dateInputView : 'd MMMM y';
      var dateFormatValue = (attr.dateInputValue && attr.dateInputValue.length) ? attr.dateInputValue : 'yyyy-MM-ddTHH:mm:ssZ';
      var defValue = (scope.ngModel && scope.ngModel.length) ? new Date(scope.ngModel) : new Date();

      ngModelCtrl.$formatters.push(function(value) {
        value = new Date(value);
        return $filter('date')(value, dateFormatView);
      });

      element.prop('readOnly', true).bind('click', function() {
        ionicDatePicker.openDatePicker({
          dateFormat: 'dd MMMM yyyy',
          inputDate: defValue,
          callback: function(value) {
            value = new Date(value);
            scope.ngModel = $filter('date')(value, dateFormatValue);
          }
        });
      });
    }
  };
})

.filter('capitalize', function() {
  return function(string) {
    return string ? string.replace(/\b\w/g, function(l){ return l.toUpperCase() }) : '';
  }
})

.filter('numKeys', function() {
  return function(json) {
    var key = 0;
    angular.forEach(json, function(item) {
      if (angular.isObject(item))
        key++;
    });
    return key;
  }
})

.filter('numChildKeys', function() {
  return function(json) {
    var keys = 0;
    angular.forEach(json, function(item){
      if (angular.isObject(item))
        keys += Object.keys(item).length;
    });
    return keys;
  }
})

.filter('getDomain', function () {
  return function (url) {
    if (url === undefined) return;
    var result = url.toString();
    return result.length ? result.replace('http://','').replace('www.','').split(/[/?#]/)[0] : '';
  };
})

.filter('getAudienceList', function () {
  return function (value) {
    var value = value || [], result = [];
    var defaults = {
      'offline': 'Offline User',
      'online': 'Online User',
      'mobile': 'Mobile User',
      'socials': 'Social Media User',
      'women': 'Mostly Women',
      'men': 'Mostly Men',
      'kids': 'Mostly Kids',
      'elderly': 'Mostly Elderly'
    };
    for (let val of value) {
      if (defaults.hasOwnProperty(val)) {
        result.push( defaults[ val ] );
      }
    }
    return result.join('\n');
  };
})

.filter('getPurpose', function () {
  return function (value) {
    var result = value || '';
    switch(value) {
      case 'ecommerce':
        result = 'Sell Things'; break;
      case 'portfolio':
        result = 'Online Profile'; break;
      case 'service':
        result = 'Provide Facilities'; break;
      case 'community':
        result = 'Gatherer Communities'; break;
    }
    return result;
  };
})

.filter('nl2br', function($sce){
  return function(msg,is_xhtml) { 
    var is_xhtml = is_xhtml || true;
    var breakTag = (is_xhtml) ? '<br />' : '<br>';
    var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
    return $sce.trustAsHtml(msg);
  }
})

.filter('toSpace', function(){
  return function(text) {
    return text ? text.replace(/[_-]/gi,' ') : '';
  }
})

.filter('relativeDate', function ($interval, moment){
  $interval(function (){}, 60000);
  function relativeDateFilter(time) {
    // var thetime = isNaN(time) ? time : parseInt(time);
    // var thedate = new Date(thetime).toISOString();
    return moment(time).fromNow();
  }
  relativeDateFilter.$stateful = true;
  return relativeDateFilter;
})

.filter('parseQuotes', function() {
  return function(quotes) {
    var qResult = [];
    angular.forEach(quotes, function(qUser) {
      if (angular.isObject(qUser)) {
        angular.forEach(qUser, function(quote) {
          qResult.push(quote);
        });
      }
    });
    return qResult;
  };
});