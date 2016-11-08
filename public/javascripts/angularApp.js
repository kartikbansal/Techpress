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
          if(authService.isLoggedIn()){
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
          flags: ['UsersService', function(UsersService) {
            return UsersService.getUser()
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
      	resolve: {
      		techItem: ['$stateParams', 'techService', function($stateParams, techService) {
      			return techService.getById($stateParams.id)
      				.then(function(response) {
      					return response.data;
      				});
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
                console.log(response.data);
                return response.data;
              })
              .catch(function(error) {
                console.log(error);
              });
          }],
          source: ['ReviewService', function(ReviewService) {
            return ReviewService.getBestSource()
              .then(function(response) {
                console.log(response.data);
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
      appId      : '312190659142847',
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
