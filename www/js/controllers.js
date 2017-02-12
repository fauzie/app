/**
 * Angular Controller Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.controllers', [])

.controller('AppCtrl', function($scope, $state, $q, $ionicModal, $timeout, $ionicLoading, addPopup, fireService, irkResults) {

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

  // Toggle Side Menu
  $scope.toggleMenu = function() {
    $scope.sideMenuController.toggleLeft();
  };

  // Create Get Quote Modal
  $ionicModal.fromTemplateUrl('templates/quote.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.quote = modal;
  });

  // Open Get Quote Modal
  $scope.getQuote = function() {
    $scope.quote.show();
  };

  // Save user and quote data then close modal
  $scope.closeModal = function() {
    var quoteResults = irkResults.getResults(), uEmail, uPasswd;

    if (quoteResults.canceled) {
      $scope.quote.hide();
      return true;
    }
    
    var quoteData = [];
    var newUserData = [];
    var todayMt = new Date().getTime();

    quoteData['created'] = todayMt;
    newUserData['created'] = todayMt;
    newUserData['updated'] = todayMt;

    $ionicLoading.show();
    quoteResults.childResults.forEach(function(field) {
      if (field.id === 'intro' || field.id === 'ending') {
        return;
      }
      if (field.id === 'account') {
        uEmail = field.answer.email;
        uPasswd = field.answer.password;
        newUserData['email'] = uEmail;
        quoteData['email'] = uEmail;
      } else 
      if (field.id === 'name') {
        newUserData['firstname'] = answer;
      } else
      if (field.id === 'mobile') {
        var answer = field.answer || '';
        newUserData['mobile'] = answer;
      }
      else {
        var answer = field.answer || '';
        quoteData[ field.id ] = answer;
      }
    });

    $scope.authObj.$createUserWithEmailAndPassword(uEmail, uPasswd)
    .then(function (newUser) {
      console.log(newUser);
      var userId = newUser.uid;
      newUser.updateProfile({ displayName: quoteData.name });
      $scope.isLoggedIn = true;

      fireService.addQuote(userId, quoteData)
      .then(function(quoteId) {
        newUserData['quotes'] = [ quoteId ];
        fireService.setUserData(userId, newUserData)
        .then(function(er) {
          $ionicLoading.hide();
          $scope.quote.hide();
          $state.go('app.client.dashboard');
        });
      });
      
    }).catch(function(err) {
      $ionicLoading.hide();
      addPopup.alert('Quote Request Failed', err);
    });    
  };

})

.controller('HomeCtrl', function($scope, $state, $ionicNavBarDelegate, $timeout) {

  $scope.about = function () {
    $state.go('app.about');
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

.controller('ClientCtrl', function ($scope, $state, $timeout, $ionicLoading, $ionicPopup, $ionicPopover, addPopup, fireService) {

  /**
   * Client Area
   ============================================================ */

  $scope.myId = 0;
  $scope.user = {};
  $scope.quotes = {};
  $scope.authObj = fireService.Auth();
  $scope.proPic = 'img/user_profile.png';
  $scope.hasProPic = false;

  $ionicLoading.show();
  
  $scope.authObj.$onAuthStateChanged(function (user) {
    if (!user) {
      $scope.user = {};
      $state.go('app.home')
      .then(function() {
        $scope.login();
      });
      return true;
    }

    $scope.myId = user.uid;
    if (user.photoURL !== null && user.photoURL.length) {
      $scope.proPic = user.photoURL;
      $scope.hasProPic = true;
    }

    fireService.getUserData(user.uid).then(function(extraData) {
      user.extraData = extraData;
      $timeout($scope.user = user, 0);

      fireService.getQuotes(user.uid).then(function(quotes) {
        $timeout($scope.quotes = quotes, 0);
      });

    }).catch(function(err) {
      console.error('Error', err);
      addPopup.alert('Something Wrong!',
        'Please check your internet connection before continue.');
    }).finally(function() {
      $ionicLoading.hide();
    });

  });

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

})

.controller('ClientQuotesCtrl', function ($scope, $q, $timeout, $ionicLoading, $ionicModal, addPopup, fireService, irkResults) {

  $scope.doRefresh = function() {
    fireService.getQuotes($scope.user.uid)
    .then(function(result) {
      $timeout($scope.quotes = result, 0);
    }).catch(function() {
      addPopup.alert('Failed to Load Quotes', 'Please check your internet connection before continue.');
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.isFuture = function (time) {
    var today = new Date().getTime();
    var thetime = new Date(time).getTime();
    return (thetime >= today);
  };

  // Create Get Quote Modal
  $ionicModal.fromTemplateUrl('templates/client/quote-form.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.quoteModal = modal;
  });

  // Save user and quote data then close modal
  $scope.closeModal = function() {
    var quoteResults = irkResults.getResults();
    console.log('quoteResults', quoteResults);

    if (quoteResults.canceled) {
      $scope.quoteModal.hide();
      return true;
    }

    var quoteData = [];
    quoteData['created'] = new Date().getTime();

    $ionicLoading.show();
    quoteResults.childResults.forEach(function(field) {
      if (field.id === 'intro' || field.id === 'ending') {
        return;
      }
      var answer = field.answer || '';
      quoteData[ field.id ] = answer;
    });
    
    fireService.addQuote($scope.user.uid, quoteData)
    .then(function(quoteId) {
      fireService.setUserQuote($scope.user.uid, quoteId)
      .then(function(res) {
        $scope.doRefresh();
      })
    }).catch(function(err) {
      addPopup.alert('Add Quote Failed', err);
    }).finally(function() {
      $ionicLoading.hide();
      $scope.quoteModal.hide();
    });

  };

})

.controller('ClientQuoteCtrl', function ($scope, $timeout, $state, $stateParams, $ionicLoading, $ionicModal, $ionicPopover, $ionicScrollDelegate, addPopup, fireService) {

  $scope.quote = {};
  $scope.id = $stateParams.quoteId;

  $scope.chat = {};
  $scope.messages = [];
  $scope.hideTime = true;

  $ionicLoading.show().then(function() {
    fireService.getQuote($scope.id).then(function(result) {
      $timeout($scope.quote = result, 0);
    }).catch(function(err) {
      addPopup.alert('Failed to Fetch Project', err);
    }).finally(function() {
      $ionicLoading.hide();
    });
  });

  $scope.doRefresh = function() {
    fireService.getQuote($scope.id)
    .then(function(result) {
      $timeout($scope.quote = result, 0);
    }).catch(function(err) {
      addPopup.alert('Failed to Fetch Project', err);
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $ionicPopover.fromTemplateUrl('templates/quote-popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.removeQuote = function() {
    $scope.popover.hide();
    var confirmRemove = addPopup.confirm(
      'Confirm to Remove Quote',
      'Are you sure you want to remove this quote? All chat and related data will be removed too!'
    );
    confirmRemove.then(function(isYes) {
      if (isYes) {
        $ionicLoading.show();
        fireService.rmQuote($scope.id)
        .then(function() {
          $ionicLoading.hide();
          $state.go('app.client.quotes');
        }).catch(function(err) {
          addPopup.alert('Failed to Remove Quote', err);
        });
      }
    });
  };

  // Chat Scope
  var alternate = true;
  // Create the chat modal that we will use later
  $ionicModal.fromTemplateUrl('templates/client/modal-chat.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.chatModal = modal;
  });

  // Triggered in the chat modal to close it
  $scope.closeChat = function() {
    $scope.chatModal.hide();
  };

  // Open the chat modal
  $scope.openChat = function() {
    $scope.chatModal.show();
  };

  $scope.sendMessage = function() {
    alternate = !alternate;

    var d = new Date();
    d = d.toLocaleTimeString().replace(/:\d+ /, ' ');

    $scope.messages.push({
      userId: alternate ? $scope.myId : 'admin',
      text: $scope.chat.message,
      time: d
    });
    console.log($scope.messages);
    delete $scope.chat.message;
    $ionicScrollDelegate.scrollBottom(true);
  };

  $scope.inputUp = function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.open();
    }
    $timeout(function() {
      $ionicScrollDelegate.scrollBottom(true);
    }, 300);
  };

  $scope.inputDown = function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.close();
    }
    $ionicScrollDelegate.resize();
  };

})

.controller('ClientSettingsCtrl', function ($scope, $state, $q, $timeout, $ionicLoading, $ionicModal, addPopup, fireService) {

  $scope.isSaving = false;
  $scope.saveClss = 'inner-default';
  $scope.password = { old: '', new: '', confirm: '' };
  $scope.mobileRegEx = "^+?\d{1,3}?[- .]?(?(?:\d{2,3}))?[- .]?\d\d\d[- .]?\d\d\d\d$";
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