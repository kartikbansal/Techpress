(function () {
  'use strict';

  var app = angular.module("techpress", ['ui.router', 'angular-medium-editor', 'ngSanitize']);

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
        		return techService.getAll();
        	}]
          // flags: ['UserService', function(UserService) {
          //   return UserService.getUser()
          //     .then(function(response) {
          //       return response.data[0].techflag;
          //     });
          // }]
        }
      })

      .state('post_review', {
      	url: '/post_review/{id}/{idx}',
      	templateUrl: '/templates/postReview.html',
      	controller: 'PostReviewCtrl as postReviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
      	resolve: {
      		techItem: ['$stateParams', 'techService', function($stateParams, techService) {
      			return techService.getById($stateParams.id, $stateParams.idx)
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
        allPosts: false,
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewPromise: ['ReviewService', function(ReviewService) {
            return ReviewService.getAll();
          }],
          allTechInfo: ['techService', function(techService) {
            return techService.getAll();
          }]
        }
      })

      .state('home2', {
        url: '/home/allReviews',
        templateUrl: '/templates/home.html',
        controller: 'PostReviewCtrl as postReviewCtrl',
        allPosts: true,
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewPromise: ['ReviewService', function(ReviewService) {
            return ReviewService.getAllReviews();
          }],
          allTechInfo: ['techService', function(techService) {
            return techService.getAll();
          }]
        }
      })

      .state('bookmarks', {
        url: '/bookmarks',
        templateUrl: '/templates/home.html',
        controller: 'PostReviewCtrl as postReviewCtrl',
        bookmarks: true,
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewPromise: ['ReviewService', function(ReviewService) {
            return ReviewService.getAllBookmarks();
          }],
          allTechInfo: ['techService', function(techService) {
            return techService.getAll();
          }]
        }
      })

      .state('topten', {
        url: '/home/top_ten',
        templateUrl: '/templates/home.html',
        controller: 'PostReviewCtrl as postReviewCtrl',
        bookmarks: true,
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewPromise: ['ReviewService', function(ReviewService) {
            return ReviewService.getTopTen();
          }],
          allTechInfo: ['techService', function(techService) {
            return techService.getAll();
          }]
        }
      })

      .state('reviewsForTag', {
        url: '/home/{tag}',
        templateUrl: '/templates/home.html',
        controller: 'PostReviewCtrl as postReviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewPromise: ['$stateParams', 'ReviewService', function($stateParams, ReviewService) {
            return ReviewService.getAllReviewsForTag($stateParams.tag);
          }],
          allTechInfo: ['techService', function(techService) {
            return techService.getAll();
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
          }],
          allTechInfo: ['techService', function(techService) {
            return techService.getAll();
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
          }],
          selectedUser: ['$stateParams', 'UserService', function($stateParams, UserService) {
            return UserService.getUser($stateParams.id)
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
          results: ['techService', function(techService) {
            return techService.getAllResults();
          }],
          allTags: ['techService', function(techService) {
            return techService.getAllTags();
          }]
        }
      })

      .state('singleReview', {
        url: '/review/{id}',
        templateUrl: 'templates/review.html',
        controller: 'ReviewCtrl as reviewCtrl',
        onEnter: ['$state', 'authService', function($state, authService) {
          if(!authService.isLoggedIn()) {
            $state.go('login');
          }
        }],
        resolve: {
          reviewInfo: ['$stateParams', 'ReviewService', function($stateParams, ReviewService) {
            return ReviewService.getPost($stateParams.id)
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
      appId: xxxxxxxxxxxxx,
      status: true,
      cookie: true,
      xfbml: true,
      version: 'v2.4'
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
