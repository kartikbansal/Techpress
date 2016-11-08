(function () {

  var app = angular.module('techpress');

  app.controller("AuthCtrl", AuthCtrlFunc);
  app.controller("MainCtrl", MainCtrlFunc);
  app.controller("PostsCtrl", PostsCtrlFunc);
  app.controller("NavCtrl", NavCtrlFunc);
  app.controller("TechnologyCtrl", TechnologyCtrl);
  app.controller("PostReviewCtrl", PostReviewCtrl);
  app.controller("ResultCtrl", ResultCtrl);

  AuthCtrlFunc.$inject = ['$scope', '$state', 'authService', '$http', 'fbAPIService'];
  function AuthCtrlFunc($scope, $state, authService, $http, fbAPIService) {
    var authCtrl = this;

    authCtrl.user = {};

    authCtrl.register = function(){
      authService.register(authCtrl.user).error(function(error){
        authCtrl.error = error;
      }).then(function(){
        $state.go('select_technology');
      });
    };

    authCtrl.logIn = function(){
      authService.logIn(authCtrl.user).error(function(error){
        authCtrl.error = error;
      }).then(function(){
        $state.go('select_technology');
      });
    };

    authCtrl.fbLogin = function() {
      FB.getLoginStatus(function(response) {
        if(response.status !== "connected") {
          FB.login(function(response) {
            if (response.authResponse) {
              fbAPIService.fbLogin()
              .then(function(response) {
                var newuser = {
                  email : response.email,
                  fullName : response.name
                }; 
                authService.fblogin(newuser).error(function(error) {
                  authCtrl.error = error;
                }).then(function() {
                  $state.go('select_technology');
                });
              });
            } else {
              console.log('User cancelled login or did not fully authorize.');
            }
          });
        } else {
          if(response.status==="connected") {
            fbAPIService.fbLogin()
            .then(function(response) {
              var newuser = {
                email : response.email,
                fullName : response.name
              }; 
              authService.fblogin(newuser).error(function(error) {
                authCtrl.error = error;
              }).then(function() {
                $state.go('select_technology');
              });
            });
          }
        }
      });   
    }
  }



  TechnologyCtrl.$inject = ['techItems', 'authService', 'flags'];
  function TechnologyCtrl(techItems, authService, flags) {
    var technologyCtrl = this;

    technologyCtrl.name = authService.currentUser();

    technologyCtrl.techItems = techItems;
    technologyCtrl.logOut = function() {
      authService.logOut();
    }

    //console.log(flags);
    technologyCtrl.check = function(item) {
      function checkitem(ele) {
        return ele === item;
      }
      return flags.find(checkitem);

    }
  }



  PostReviewCtrl.$inject = ['ReviewService', 'techService', 'authService', '$state'];
  function PostReviewCtrl(ReviewService, techService, authService, $state) {
    var postReviewCtrl = this;

    postReviewCtrl.techInfo = techService.techItem[0];

    postReviewCtrl.score = 0;

    postReviewCtrl.allReviews = ReviewService.getReviews();
    //console.log(postReviewCtrl.allReviews);

    postReviewCtrl.addReview = function() {
      if(!postReviewCtrl.title || postReviewCtrl.title === '' || !postReviewCtrl.body || postReviewCtrl.body === '' || !postReviewCtrl.source || postReviewCtrl.source === '' || postReviewCtrl.score === 0)
        return;

      var promise = ReviewService.addReview(postReviewCtrl.title, postReviewCtrl.body, postReviewCtrl.source, postReviewCtrl.score, postReviewCtrl.techInfo);

      promise.then(function(response) {
        $state.go('home');
      })
      .catch(function(error) {
        console.log(error)
      });

      postReviewCtrl.title = '';
      postReviewCtrl.body = '';
      postReviewCtrl.source = '';
      postReviewCtrl.score = 0;
    }

    var arrPromise = ReviewService.getCurrVotedReview();
    arrPromise.then(function(response) {
      console.log(response.data);
      postReviewCtrl.arrEle = response.data[0].votedReview;
      console.log(arrPromise);
      postReviewCtrl.check = function(id) {
        function checkitem(ele) {
          return ele === id;
        }
        if(postReviewCtrl.arrEle.length !== 0)
          return postReviewCtrl.arrEle.find(checkitem);
        else
          return false;
      }
    }).catch(function(error) {
      console.log(error);
    });

   

    postReviewCtrl.checkFlag = false;

    postReviewCtrl.upvote = function(review) {
      postReviewCtrl.checkFlag = ReviewService.upvote(review);
      $state.reload('home');
    }

    postReviewCtrl.downvote = function(review) {
      postReviewCtrl.checkFlag = ReviewService.downvote(review);
    }

  }




  MainCtrlFunc.$inject = ['PostsService', 'authService'];
  function MainCtrlFunc(PostsService, authService) {
    var Ctrl1 = this;

    Ctrl1.posts = PostsService.getPosts();

    Ctrl1.isLoggedIn = authService.isLoggedIn;

    Ctrl1.addPost = function() {
      if(!Ctrl1.title || Ctrl1.title === '')
        return;
      PostsService.addPost(Ctrl1.title, Ctrl1.link);
      Ctrl1.title = '';
      Ctrl1.link = '';
    }

    Ctrl1.incrementUpvotes = function(post) {
      PostsService.incrementUpvotes(post);
    }
  }



  PostsCtrlFunc.$inject = ['PostsService', '$stateParams', 'post', 'authService'];
  function PostsCtrlFunc(PostsService, $stateParams, post, authService) {
    
    var Ctrl2 = this;

    Ctrl2.isLoggedIn = authService.isLoggedIn;

    Ctrl2.post = post;

    Ctrl2.addComment = function() {
      if(Ctrl2.body === '') return;
      PostsService.addComment(Ctrl2.post, Ctrl2.body);
      Ctrl2.body = '';
    }

    Ctrl2.incrementUpvotes = function(comment) {
      PostsService.upvoteComment(post, comment)
    }

  }


  ResultCtrl.$inject = ['allTechInfo', 'source'];
  function ResultCtrl(allTechInfo, source) {
    var resultCtrl = this;
    console.log(allTechInfo);
    resultCtrl.allTech = allTechInfo;
  }


  NavCtrlFunc.$inject = ['authService', '$state'];
  function NavCtrlFunc(authService, $state) {
    var navCtrl = this;
    navCtrl.state = $state;
    navCtrl.isLoggedIn = authService.isLoggedIn;
    navCtrl.currentUser = authService.currentUser;
    navCtrl.logOut = authService.logOut;
  }

})();




