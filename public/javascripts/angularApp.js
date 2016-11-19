(function () {
  'use strict';

  var app = angular.module("techpress", ['ui.router']);

  app.config(Config);

  Config.$inject = ['$stateProvider','$urlRouterProvider'];
  function Config($stateProvider, $urlRouterProvider) {
    $stateProvider
      
      .state('login', {
        url: '/login',
        templateUrl: '/templates/login.html',
        controller: 'AuthCtrl as authCtrl',
        hideNavbar: true,
        onEnter: ['$state', 'authService', function($state, authService) {
          if(authService.isLoggedIn()) {
            $state.go('home');
          }
        }]
      })

      .state('register', {
        url: '/register',
        templateUrl: '/templates/register.html',
        controller: 'AuthCtrl as authCtrl',
        hideNavbar: true,
        onEnter: ['$state', 'authService', function($state, authService){
          if(authService.isLoggedIn()) {
            $state.go('home');
          }
        }]
      })

      .state('select_technology', {
        url: '/select_technology',
        templateUrl: '/templates/select_technology.html',
        controller: 'TechnologyCtrl as technologyCtrl',
        hideNavbar: true,
        onEnter: ['$state', 'authService', function($state, authService){
          if(!authService.isLoggedIn()){
            $state.go('login');
          }
        }],
        resolve: {
        	techItems: ['techService', function(techService) {
        		return techService.getAll()
        			.then(function(response) {
        				return response.data;
        			});
        	}],
          flags: ['UserService', function(UserService) {
            return UserService.getUser()
              .then(function(response) {
                return response.data[0].techflag;
              });
          }]
        }
      })

      .state('post_review', {
      	url: '/post_review/{id}',
      	templateUrl: '/templates/postReview.html',
      	controller: 'PostReviewCtrl as postReviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          } 
        }],
      	resolve: {
      		techItem: ['$stateParams', 'techService', function($stateParams, techService) {
      			return techService.getById($stateParams.id)
      				.then(function(response) {
      					return response.data;
      				});
      		}]
      	}
      })

      .state('edit_review', {
        url: '/edit_review/{id}',
        templateUrl: '/templates/editReview.html',
        controller: 'EditReviewCtrl as editReviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          review: ['$stateParams', 'EditReviewService', function($stateParams, EditReviewService) {
            return EditReviewService.getReview($stateParams.id);
          }]
        }
      })

      .state('home', {
        url: '/home',
        templateUrl: '/templates/home.html',
        controller: 'PostReviewCtrl as postReviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }    
        }],
        resolve: {
          reviewPromise: ['ReviewService', function(ReviewService) {
            return ReviewService.getAll();
          }]
        }
      })

      .state('tech', {
        url: '/tech/{id}',
        templateUrl: '/templates/home.html',
        controller: 'PostReviewCtrl as postReviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewPromise: ['$stateParams', 'ReviewService', function($stateParams, ReviewService) {
            return ReviewService.getAllTech($stateParams.id);
          }]
        }
      })

      .state('user', {
        url: '/user/{id}',
        templateUrl: '/templates/user.html',
        controller: 'UserCtrl as userctrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          userReviews: ['$stateParams', 'UserService', function($stateParams, UserService) {
            return UserService.getUserDetails($stateParams.id)
              .then(function(response) { 
                return response.data;
              });
          }],
          currentUser: ['UserService', function(UserService) {
            return UserService.getUser()
              .then(function(response) {
                return response.data;
              });
          }]
        }
      })

      .state('results', {
        url: '/results',
        templateUrl: '/templates/results.html',
        controller: 'ResultCtrl as resultCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          allTechInfo: ['techService', function(techService) {
            return techService.getAll()
              .then(function(response) {
                return response.data;
              })
              .catch(function(error) {
                console.log(error);
              });
          }]
        }
      });

    $urlRouterProvider.otherwise('/login');
  }


  window.fbAsyncInit = function() {
    FB.init({
      appId      : 'MY_FB_APP_ID',
      xfbml      : true,
      version    : 'v2.4'
    });
  };

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

})();
