/**
 * Angular Controller Module
 * 
 * @since     1.0.0
 * @author    Rizal Fauzie <rizal@fauzie.my.id>
 * @package   fauzie.app
 */

angular.module('fauzie.controllers', [])

.controller('AppCtrl', function($scope, $state, $q, $timeout, $ionicModal, $ionicHistory, $ionicLoading, addPopup, fireService, irkResults) {

  // Form data for the login modal
  $scope.loginData  = {};
  $scope.adminId    = '';
  $scope.isLoading  = false;
  $scope.isLoggedIn = false;
  $scope.isAdmin    = false;
  $scope.$state     = $state;
  $scope.authObj    = fireService.Auth();
  $scope.nowHref    = window.location.href;

  fireService.setAdmin();

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  $scope.goDashboard = function(reload) {
    reload = reload || false;
    if ($scope.isAdmin) {
      $state.go('app.admin.dashboard', {}, {reload: true});
    } else {
      $state.go('app.client.dashboard', {}, {reload: true});
    }
    if (reload) {
      window.location.reload(true);
    }
  };

  $scope.forceReload = function() {
    if (navigator.splashscreen) {
      navigator.splashscreen.show();
    }
    window.location.reload(true);
  };

  $scope.updateAuth = function(user) {
    if (user) {
      var adminId = fireService.getAdmin();
      if (user.uid === adminId) {
        $scope.isAdmin = true;
      }
      $scope.loginData = user;
      $scope.isLoggedIn = true;
    } else {
      $scope.isLoggedIn = false;
    }
  };

  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    $scope.updateAuth(firebaseUser);
  });

  // Check for user hold and release touch action
  var userHoldTime = 0;
  $scope.hold = function(event) {
    userHoldTime = event.timestamp;
    console.log(userHoldTime);
  };

  $scope.release = function (event) {
    console.log(event.timestamp - userHoldTime);
    if (event.timestamp - userHoldTime > 3000) {
      $scope.forceReload();
    }
    userHoldTime = 0;
  };

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Create the reset password modal
  $ionicModal.fromTemplateUrl('templates/lostpass.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.lostPass = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $scope.lostPass.hide();
    $scope.isLoading = false;
  };

  // Open the login modal
  $scope.login = function() {
    if ($scope.isLoggedIn) {
      $state.go('app.client.dashboard', {}, {reload: true});
    } else {
      $scope.lostPass.hide();
      $scope.modal.show();
    }
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $scope.quoteModal.hide();
    if ($scope.isLoggedIn) {
      $scope.goDashboard();
      return;
    }
    $scope.loginData = $scope.loginData || {"email":"","password":""};
    $scope.isLoading = true;
    $scope.authObj.$signInWithEmailAndPassword($scope.loginData.email, $scope.loginData.password).then(function(currentUser) {
      console.log("Signed in as: ", currentUser.uid);
      $scope.closeLogin();
      $scope.isLoggedIn = true;
      $scope.goDashboard(true);
    }).catch(function(error) {
      $scope.isLoading = false;
      addPopup.alert('Login Failed', error);
    });
  };

  // Perform reset password send to user email
  $scope.doReset = function() {
    $scope.quoteModal.hide();
    if ($scope.isLoggedIn) {
      $scope.goDashboard();
      return;
    }
    $scope.isLoading = true;
    var uEmail = $scope.resetPassEmail || '';
    $scope.authObj.$sendPasswordResetEmail(uEmail).then(function() {
      addPopup.alert('Password Reset Success', 'A link to reset your password has been sent. Please check your email to continue.');
      $scope.closeLogin();
    }).catch(function(error) {
      addPopup.alert('Password Reset Failed', error.message);
    }).finally(function() {
      $scope.isLoading = false;
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
    $scope.quoteModal = modal;
  });

  // Open Get Quote Modal
  $scope.getQuote = function() {
    $scope.quoteModal.show();
  };

  // Save user and quote data then close modal
  $scope.closeModal = function() {
    var quoteResults = irkResults.getResults(), uEmail, uPasswd;

    if (quoteResults.canceled) {
      $scope.quoteModal.hide();
      return;
    }
    
    var quoteData = [];
    var newUserData = [];
    var todayMt = new Date().toISOString();

    quoteData['status'] = 'on_hold';
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
          $scope.quoteModal.hide();
          $scope.goDashboard(true);
        });
      });
      
    }).catch(function(err) {
      $ionicLoading.hide();
      addPopup.alert('Quote Request Failed', err);
    });
  };

})

.controller('HomeCtrl', function($scope, $state, $ionicNavBarDelegate, $ionicLoading, $timeout) {

  $scope.logoclass = 'transparent';
  $scope.imgclass = 'transparent';

  $ionicLoading.show();

  $scope.$on('$ionicView.enter', function(){
    $scope.authObj.$onAuthStateChanged(function(fUser) {
      $ionicLoading.hide();
      $scope.updateAuth(fUser);
      $timeout( function() { $ionicNavBarDelegate.align('center') }, 0 );
      $timeout( function() { $scope.logoclass = 'animated flipInX' }, 600 );
      $timeout( function() { $scope.imgclass = 'animated zoomIn' }, 900 );
    });
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

.controller('ExpsCtrl', function($scope, $timeout, $interval, $ionicLoading, fireService, addPopup) {

  $scope.exps = [];

  $ionicLoading.show()
  .then(function(){
    fireService.getData('experiences', 'date')
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

.controller('SkillsCtrl', function($scope, $timeout, $ionicLoading, $filter, fireService, addPopup) {

  $scope.skills = [];
  var setSkills = function(data) {
    var lastChar = '';
    var list = $filter('orderBy')(data, 'type', true);
    for(var i=0,len=list.length; i<len; i++) {
      var item = list[i];
      if(item.type.charAt(0) != lastChar) {
        var divider = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        $scope.skills.push({ name: divider, value: 0, icon: '', divider: true });
        lastChar = item.type.charAt(0);
      }
      $scope.skills.push(item);
    }
  };

  $ionicLoading.show()
  .then(function(){
    fireService.getData('skills', 'type', 'DESC')
    .then(function(_data) {
      $ionicLoading.hide();
      $timeout(setSkills(_data), 0);
    }).catch(function(error) {
      console.error('Error', error);
      addPopup.alert('Something Wrong!', 
      'Please check your internet connection before continue.');
    });
  });

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

  $scope.onVisible = function(inview, inviewInfo) {
    var el = inviewInfo.element;
    if (el.hasClass('animated')) return;
    if (inview) el.addClass('animated fadeInUpBig');
  };

})

.controller('ProjectsCtrl', function($scope, $timeout, $ionicLoading, fireService, addPopup) {

  $scope.projects = [];

  $ionicLoading.show()
  .then(function(){
    fireService.getData('projects', 'year')
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

.controller('ProjectCtrl', function($scope, $state, $timeout, $stateParams, $ionicLoading, $cordovaSocialSharing, fireService, addPopup) {

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

  $scope.goBack = function() {
    $state.go('app.projects');
  };

})

.controller('ClientCtrl', function ($scope, $state, $timeout, $ionicLoading, $ionicPopup, $ionicPopover, $ionicActionSheet, $cordovaCamera, $cordovaFile, $firebaseStorage, addPopup, fireService) {

  /**
   * Client Area
   ============================================================ */

  $scope.myId = 0;
  $scope.user = {};
  $scope.quotes = {};
  $scope.authObj = fireService.Auth();
  $scope.proPic = 'img/user_profile.png';
  $ionicLoading.show();
  
  $scope.authObj.$onAuthStateChanged(function (user) {
    $scope.updateAuth(user);
    if (!user) {
      $scope.user = {};
      $state.go('app.home')
      .then(function() {
        $scope.login();
      });
      return true;
    }

    if ($scope.isAdmin) {
      $state.go('app.admin.dashboard', {}, {reload: true});
    }

    $scope.myId = user.uid;
    fireService.getUserData(user.uid).then(function(extraData) {
      user.extraData = extraData;
      $timeout($scope.user = user, 0);

      fireService.getUserAvatar($scope.myId)
      .$getDownloadURL().then(function(url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        if (http.status != 404) {
          $timeout($scope.proPic = url, 0);
        }
      });

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

  // Force refresh dashboard
  $scope.refreshDashboard = function() {
    $scope.authObj.$onAuthStateChanged(function(user) {
      $scope.updateAuth(user);
      if (user) {
        $scope.myId = user.uid;
        fireService.getUserData(user.uid).then(function(extraData) {
          user.extraData = extraData;
          $timeout($scope.user = user, 0);
          fireService.getQuotes(user.uid).then(function(quotes) {
            $timeout($scope.quotes = quotes, 0);
          });
          fireService.getUserAvatar(user.uid).$getDownloadURL().then(function(url) {
            $timeout($scope.proPic = url, 0);
          });
        }).catch(function(err) {
          addPopup.alert('Failed to Refresh', err);
        }).finally(function() {
          $scope.$broadcast('scroll.refreshComplete');
        });
      } else {
        $scope.user = {};
        $state.go('app.home')
        .then(function() {
          $scope.login();
        });
        return true;
      }
    });
  };

  $scope.statusClass = function(stat) {
    var statuses = {
      "active": "positive",
      "on_hold": "calm",
      "in_progress": "balanced",
      "done": "assertive",
      "canceled": "royal"
    };
    return statuses[stat] ? 'badge-'+statuses[stat] : 'badge-royal';
  };

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.showAvatarMenu = function() {
    var menuOptions = {
      buttons: [
        { text: 'Photo Library' },
        { text: 'Camera Phone' }
      ],
      cancelText: 'Cancel',
      destructiveText: 'Cancel',
      titleText: 'Choose an Avatar Source',
      destructiveButtonClicked: function() {
        return true;
      },
      buttonClicked: function(btnIndex) {
        var type = null;
        if (btnIndex === 0) {
          type = Camera.PictureSourceType.PHOTOLIBRARY;
        } else if (btnIndex === 1) {
          type = Camera.PictureSourceType.CAMERA;
        }
        if (type !== null) {
          $scope.selectPicture(type);
        } else {
          return true;
        }
      }
    };
    $scope.hideSheet = $ionicActionSheet.show(menuOptions);
  };

  // Take image with the camera or from library and store it inside the app folder
  // Image will not be saved to users Library.
  $scope.selectPicture = function(sourceType) {
    var options = {
      quality: 60,
      targetWidth: 450,
      targetHeight: 460,
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: sourceType,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
    
    $cordovaCamera.getPicture(options).then(function(imageData) {

      $ionicLoading.show({
        scope: $scope,
        template: '<div id="uploadProgress" class="progress-bar"><span style="width:{{upProgress}}%">&nbsp;</span></div>'
      });
      $scope.hideSheet();

      var uploadTask = fireService.getUserAvatar($scope.myId)
      .$putString(imageData, 'base64', { contentType: "image/jpeg" });

      uploadTask.$progress(function(snapshot) {
        $scope.upProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('UploadProgress', $scope.upProgress);
      });

      uploadTask.$complete(function(snapshot) {
        $scope.proPic = snapshot.downloadURL;
        $cordovaCamera.cleanup();
        $ionicLoading.hide();
      });

      uploadTask.$error(function(error) {
        addPopup.alert('Upload Failed', error);
        $ionicLoading.hide();
      });
  
    })
    .catch(function(error) {
      addPopup.alert('Upload Failed', error);
      $ionicLoading.hide();
    });
  };

  $scope.getAvatar = function(userId) {
    if (userId == 'admin') {
      return 'img/fauzie-ava.jpg';
    } else {
      return $scope.proPic;
    }
  };

})

.controller('ClientQuotesCtrl', function ($scope, $q, $timeout, $ionicLoading, $ionicListDelegate, $ionicModal, $ionicHistory, addPopup, fireService, moment, irkResults) {

  $scope.closeOptionButtons = function(){
    $ionicListDelegate.closeOptionButtons();
  };

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
    return moment(time).isAfter(new Date());
  };

  // Create Get Quote Modal
  $ionicModal.fromTemplateUrl('templates/client/quote-form.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.quoteModalUser = modal;
  });

  // Save user and quote data then close modal
  $scope.closeModal = function() {
    var quoteResults = irkResults.getResults();
    console.log('quoteResults', quoteResults);

    if (quoteResults.canceled) {
      $scope.quoteModalUser.hide();
      return true;
    }

    var quoteData = [];
    quoteData['status'] = 'on_hold';
    quoteData['created'] = new Date().toISOString();

    $ionicLoading.show();
    quoteResults.childResults.forEach(function(field) {
      if (field.id === 'intro' || field.id === 'ending') {
        return;
      }
      var answer = field.answer || '';
      quoteData[ field.id ] = answer;
    });
    
    fireService.addQuote($scope.myId, quoteData)
    .then(function(quoteId) {
      fireService.setUserQuote($scope.myId, quoteId)
      .then(function(res) {
        $scope.doRefresh();
      })
    }).catch(function(err) {
      addPopup.alert('Add Quote Failed', err);
    }).finally(function() {
      $ionicLoading.hide();
      $scope.quoteModalUser.hide();
    });

  };

})

.controller('ClientQuoteCtrl', function ($scope, $timeout, $state, $stateParams, $ionicLoading, $ionicModal, $ionicPopover, $ionicScrollDelegate, $ionicHistory, addPopup, fireService, fireChats) {

  $scope.quote = {};
  $scope.id = $stateParams.quoteId;
  $scope.isSubmitting = false;
  $scope.isEdited = false;
  $scope.dateTimeToday = new Date().toISOString();
  $scope.domainRegex = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
  $scope.purposeOptions = [
    { value: 'ecommerce', icon: 'ion-ios-cart', label: 'Sell Things' },
    { value: 'portfolio', icon: 'ion-ios-body', label: 'Online Profile' },
    { value: 'service', icon: 'ion-ios-gear', label: 'Provide Facilities' },
    { value: 'community', icon: 'ion-ios-people', label: 'Gatherer Communities' }
  ];
  $scope.audienceOptions = [
    { value: 'offline', label: 'Offline User' },
    { value: 'online', label: 'Online User' },
    { value: 'mobile', label: 'Mobile User' },
    { value: 'socials', label: 'Social Media User' },
    { value: 'women', label: 'Mostly Women' },
    { value: 'men', label: 'Mostly Men' },
    { value: 'kids', label: 'Mostly Kids' },
    { value: 'elderly', label: 'Mostly Elderly' }
  ];
  $scope.optionYesNo = [
    { value: 'true', label: 'Yes, Optimize for SEO' },
    { value: 'false', label: 'No, It\'s not required' }
  ];

  // Chat Scope
  $scope.chat = {};
  $scope.messages = [];
  $scope.hideTime = true;
  $scope.latestMessageId = fireChats.getLatest($scope.id);
  $scope.msgObj = fireChats.getMessages($scope.id);

  $scope.$watch('messages', function(event) {
    if (event.prevChild !== null && ($scope.latestMessageId == event.prevChild || $scope.latestMessageId === null)) {
      fireChats.setLatest( event.key, $scope.id );
      $scope.latestMessageId = event.key;
      console.log('messages.event', 'New Message ID: '+event.key);
    }
  });

  $ionicLoading.show().then(function() {
    $scope.msgObj.then(function(msg) {
      $scope.messages = msg;
    });
    fireService.getQuote($scope.id).then(function(result) {
      $timeout($scope.quote = result, 0);
    }).catch(function(err) {
      addPopup.alert('Failed to Fetch Project', err);
    }).finally(function() {
      $ionicLoading.hide();
    });
  });

  $scope.doRefresh = function() {
    $scope.msgObj.then(function(msg) {
      $scope.messages = msg;
    });
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

  // Quote Edit Form
  $scope.editQuote = function() {
    $state.go('app.client.quotedit', {quoteId:$scope.id}, {reload: true});
    $scope.isSubmitting = false;
    $scope.isEdited = false;
  };

  $scope.$watch('quote', function() {
    console.log($scope.quote);
    $scope.isEdited = true;
  }, true);

  $scope.saveQuote = function() {
    $scope.isSubmitting = true;
    $scope.quote.$save().then(function() {
      $scope.isSubmitting = false;
      $scope.isEdited = false;
    });
  };

  // Create the chat modal that we will use later
  $ionicModal.fromTemplateUrl('templates/client/modal-chat.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.chatModal = modal;
  });

  // Add new message
  $scope.sendMessage = function() {
    $scope.messages.$add({
      userId: $scope.myId,
      text: $scope.chat.message,
      time: new Date().toISOString()
    }).then(function(ref) {
      fireChats.setLatest( ref.key, $scope.id );
    });
    
    delete $scope.chat.message;

    $ionicScrollDelegate.scrollBottom(true);
  };

  $scope.inputUp = function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.show();
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

})

.controller('AdminCtrl', function($scope, $rootScope, $state, $q, $http, $ionicLoading, $ionicPopover, $ionicListDelegate, $ionicSideMenuDelegate, addPopup, fireAdmin) {

  /**
   * Admin Area
   ============================================================ */

  var defBack = { site: false };

  $scope.site     = {};
  $scope.users    = {};
  $scope.quotes   = {};
  $scope.messages = {};
  $scope.ionicons = [];
  $rootScope.showBack = defBack;

  $scope.resetAll = function() {
    $rootScope.showBack = defBack;
  };

  $ionicLoading.show();
  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    $scope.updateAuth(firebaseUser);
    if (!$scope.isAdmin) {
      $ionicLoading.hide();
      $state.go('app.home');
    }
    $scope.refreshData();
  });

  $scope.refreshData = function() {
    $q.all([
      $http.get('js/ionicons.json'),
      fireAdmin.getAll('site'),
      fireAdmin.getAll('users'),
      fireAdmin.getAll('quotes'),
      fireAdmin.getAll('messages')
    ]).then(function(res) {
      if (res.length < 5) {
        $q.reject('Please check your internet connection.');
        return;
      }
      console.log('Admin Dashboard refreshed successfully.');
      $scope.ionicons = res[0].data;
      res[1].$bindTo($scope, 'site');
      res[2].$bindTo($scope, 'users');
      res[3].$bindTo($scope, 'quotes');
      res[4].$bindTo($scope, 'messages');
    }).catch(function(err) {
      addPopup.alert('Something Wrong', err);
    }).finally(function() {
      if ($ionicLoading._getLoader().$$state.value.isShown) {
        $ionicLoading.hide();
      }
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $ionicPopover.fromTemplateUrl('templates/admin/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.adminNavMenu = popover;
  });

  $scope.closeOptionButtons = function(){
    $ionicListDelegate.closeOptionButtons();
  };

  $scope.backTo = function(dest) {
    if ($rootScope.showBack[dest]) {
      $rootScope.showBack[dest] = false;
      $state.transitionTo('app.admin.'+dest);
    } else {
      $ionicSideMenuDelegate.toggleLeft();
    }
  };
  
})

.controller('AdminPostListCtrl', function($scope, $rootScope, $state, $stateParams, $ionicNavBarDelegate) {

  $rootScope.showBack.site = true;
  $scope.type  = $stateParams.postType;
  $scope.lists = $scope.site[ $scope.type ];

  var typeName = $scope.type.replace(/\b\w/g, function(l){ return l.toUpperCase() });
  $ionicNavBarDelegate.title(typeName+' Lists');
  $ionicNavBarDelegate.showBackButton(true);

  $scope.$watch('site', function() {
    window.localStorage.removeItem('site:'+$scope.type);
  });

})

.controller('AdminPostEditCtrl', function($scope, $rootScope, $state, $stateParams, postType, addPopup) {
  $rootScope.showBack.site = true;
  $scope.type = postType;
  $scope.key  = $stateParams.postKey;
  $scope.list = $scope.site[ $scope.type ];
  $scope.form = $scope.list[ $scope.key ];

  var deleteFunc = function(confirm) {
    if (!confirm) return;
    delete $scope.site[ $scope.type ][ $scope.key ];
    var unWatch = $scope.$watch('site', function() {
      $scope.backTo('site');
      unWatch();
    }, 3000);
  };

  $scope.deleteItem = function() {
    var confirmRemove = addPopup.confirm(
      'Confirm to Remove Item',
      'Are you sure you want to remove item? <br>'+$scope.type+' :<strong>'+$scope.key+'</strong>'
    );
    confirmRemove.then(deleteFunc);
  };

})

.controller('AdminPostNewCtrl', function($scope, $rootScope, postType) {
  $rootScope.showBack.site = true;
  $scope.type = postType;
  $scope.list = $scope.site[ postType ];
})

.controller('AdminPostNewForm', function($scope, $rootScope, $state, $timeout, addPopup) {

  var keySource = {
    experiences: function(data) {
      if (!data.date) return new Date().getTime();
      return new Date(data.date).getTime();
    },
    gallery: function(data) {
      if (data.title) {
        return data.title.replace(/[^\w]/gi, '').toLowerCase();
      } else {
        return new Date().getTime();
      }
    }
  };

  $scope.formData  = {};
  $scope.isLoading = false;

  $scope.saveNewPost = function() {
    var newKey  = '';
    var results = $scope.newForm[ $scope.type ];
    $scope.isLoading = true;

    if (!results.$valid) {
      addPopup.alert('Form Invalid', 'Please make sure all field is valid.');
      return;
    }

    angular.forEach(results, function(item, key) {
      if (key.charAt(0) !== '$') {
        if (key == 'date') {
          item = new Date(item).toISOString();
        } else
        if (key == 'year') {
          item = new Date(item).getFullYear();
        }
        $scope.formData[ key ] = item;
      }
    });

    //$scope.lists.push($scope.formData);
    newKey = keySource[$scope.type]( $scope.formData );
    $timeout($scope.list[ newKey ] = $scope.formData, 0);

    var unWatchListings = $scope.$watch('lists', function() {
      console.log( 'Added key '+newKey+', with data:', $scope.formData );
      $scope.formData = {};
      $scope.isLoading = false;
      results.$setUntouched();
      results.$setPristine();
      $scope.newForm[ $scope.type ] = {};
      document.getElementById('newForm').reset();
      unWatchListings();
      // Fast preview a new list
      $state.go('app.admin.site.list', {postType:$scope.type}, {reload:true});
    }, 3000);
  };

});