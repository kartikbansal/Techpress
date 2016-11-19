(function () {

  var app = angular.module('techpress');

  app.controller("AuthCtrl", AuthCtrlFunc);
  app.controller("NavCtrl", NavCtrlFunc);
  app.controller("TechnologyCtrl", TechnologyCtrl);
  app.controller("PostReviewCtrl", PostReviewCtrl);
  app.controller("ResultCtrl", ResultCtrl);
  app.controller("UserCtrl", UserCtrl);
  app.controller("EditReviewCtrl", EditReviewCtrl);

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

    technologyCtrl.check = function(item) {
      function checkitem(ele) {
        return ele === item;
      }
      return flags.find(checkitem);
    }

    technologyCtrl.logOut = authService.logOut;
  }



  PostReviewCtrl.$inject = ['ReviewService', 'techService', 'authService', '$state', '$stateParams', '$window'];
  function PostReviewCtrl(ReviewService, techService, authService, $state, $stateParams, $window) {
    var postReviewCtrl = this;
    var currUserID = authService.currentUserID();
    postReviewCtrl.arrEle = [];

    postReviewCtrl.techInfo = techService.techItem[0];

    postReviewCtrl.score = 0;

    postReviewCtrl.allReviews = ReviewService.getReviews();
    
    postReviewCtrl.checkCurrUser = function(id) {
      if(id === currUserID)
        return true;
    }

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
      postReviewCtrl.arrEle = response.data[0].votedReview;
      }).catch(function(error) {
      console.log(error);
    });
    
    postReviewCtrl.check = function(id) {
      function checkitem(ele) {
        return ele === id;
      }
      if(postReviewCtrl.arrEle.length !== 0)
        return postReviewCtrl.arrEle.find(checkitem);
      else
        return false;
    }

    postReviewCtrl.upvote = function(review) {
      ReviewService.upvote(review);
      postReviewCtrl.arrEle.push(review._id);
    }

    postReviewCtrl.downvote = function(review) {
      ReviewService.downvote(review);
      postReviewCtrl.arrEle.push(review._id);
    }

  }


  ResultCtrl.$inject = ['allTechInfo'];
  function ResultCtrl(allTechInfo) {
    var resultCtrl = this;
    resultCtrl.allTech = allTechInfo;

    resultCtrl.checkZero = function(val) {
      if(val==0)
        return false;
      else
        return true;
    }
  }

  UserCtrl.$inject = ['userReviews', 'UserService', 'currentUser'];
  function UserCtrl(userReviews, UserService, currentUser) {
    var userctrl = this;
    var currUserID = currentUser[0]._id;
    var followees = currentUser[0].followees;
    userctrl.currFlag = true;
    userctrl.followFlag = false;


    for(let i=0; i<followees.length; i++) {
      if(followees[i] == userReviews[0].userID._id) {
        userctrl.followFlag = true;
        break;
      }
    }

    if(currUserID === userReviews[0].userID._id) {
      userctrl.currFlag = false;
    }
    userctrl.userReviews = userReviews;

    userctrl.addFollower = function(id) {
      userctrl.followFlag = UserService.addFollower(id);
    }

    userctrl.removeFollower = function(id) {
      userctrl.followFlag = !(UserService.removeFollower(id));
    }
  }

  NavCtrlFunc.$inject = ['authService', '$state'];
  function NavCtrlFunc(authService, $state) {
    var navCtrl = this;
    navCtrl.state = $state;
    navCtrl.isLoggedIn = authService.isLoggedIn;
    navCtrl.currentUser = authService.currentUser;
    navCtrl.currentUserID = authService.currentUserID;
    navCtrl.logOut = authService.logOut;
  }

  EditReviewCtrl.$inject = ['EditReviewService', 'review', '$state'];
  function EditReviewCtrl(EditReviewService, review, $state) {
    var editReviewCtrl = this;
    editReviewCtrl.review = review.data[0].review;
    editReviewCtrl.techInfo = review.data[0].technology;
    var oldRating = review.data[0].review.rating;
    editReviewCtrl.editReview = function() {
      if(!editReviewCtrl.review.title || editReviewCtrl.review.title === '' || !editReviewCtrl.review.body || editReviewCtrl.review.body === '' || !editReviewCtrl.review.source || editReviewCtrl.review.source === '' || editReviewCtrl.review.rating === 0)
        return;

      var promise = EditReviewService.editReviewfunc(editReviewCtrl.review.title, editReviewCtrl.review.body, editReviewCtrl.review.source, editReviewCtrl.review.rating, editReviewCtrl.techInfo.techID._id, oldRating);

      promise.then(function(response) {
        $state.go('home');
      })
      .catch(function(error) {
        console.log(error)
      });
    }
  }

})();




