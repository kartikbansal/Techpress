(function () {

  var app = angular.module('techpress');

  app.controller("AuthCtrl", AuthCtrlFunc);
  app.controller("NavCtrl", NavCtrlFunc);
  app.controller("TechnologyCtrl", TechnologyCtrl);
  app.controller("PostReviewCtrl", PostReviewCtrl);
  app.controller("ResultCtrl", ResultCtrl);
  app.controller("UserCtrl", UserCtrl);
  app.controller("EditReviewCtrl", EditReviewCtrl);
  app.controller("ReviewCtrl", ReviewCtrl);

  AuthCtrlFunc.$inject = ['$scope', '$state', 'authService', '$http', 'fbAPIService'];
  function AuthCtrlFunc($scope, $state, authService, $http, fbAPIService) {
    var authCtrl = this;

    authCtrl.user = {};

    authCtrl.register = function(){
      authService.register(authCtrl.user).error(function(error){
        authCtrl.error = 'User already exists';
      }).then(function(){
        $state.go('select_technology');
      });
    };

    authCtrl.logIn = function(){
      authService.logIn(authCtrl.user).error(function(error){
        authCtrl.error = error.message;
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



  // TechnologyCtrl.$inject = ['authService', 'flags', 'techService'];
  // function TechnologyCtrl(authService, flags, techService) {
  //   var technologyCtrl = this;
  //
  //   technologyCtrl.name = authService.currentUser();
  //
  //   technologyCtrl.techItems = techService.getTechInfo();
  //   technologyCtrl.logOut = function() {
  //     authService.logOut();
  //   }
  //
  //   // technologyCtrl.check = function(item) {
  //   //   function checkitem(ele) {
  //   //     return ele === item;
  //   //   }
  //   //   return flags.find(checkitem);
  //   // }
  //
  //   technologyCtrl.logOut = authService.logOut;
  // }

  TechnologyCtrl.$inject = ['authService', 'techService'];
  function TechnologyCtrl(authService, techService) {
    var technologyCtrl = this;

    technologyCtrl.name = authService.currentUser();

    technologyCtrl.techItems = techService.getTechInfo();
    //console.log(technologyCtrl.techItems);
    technologyCtrl.logOut = function() {
      authService.logOut();
    }

    // technologyCtrl.check = function(item) {
    //   function checkitem(ele) {
    //     return ele === item;
    //   }
    //   return flags.find(checkitem);
    // }

    technologyCtrl.logOut = authService.logOut;
  }



  PostReviewCtrl.$inject = ['ReviewService', 'techService', 'authService', '$state', '$stateParams', '$window', 'UserService'];
  function PostReviewCtrl(ReviewService, techService, authService, $state, $stateParams, $window, UserService) {
    var postReviewCtrl = this;
    var currUserID = authService.currentUserID();
    postReviewCtrl.arrEle = [];
    postReviewCtrl.techFollow = [];
    postReviewCtrl.bookmarks = [];
    postReviewCtrl.tags = [];

    postReviewCtrl.allTechInfo = techService.getTechInfo();

    postReviewCtrl.techInfo = techService.techItem[0];

    postReviewCtrl.score = 0;

    postReviewCtrl.allReviews = ReviewService.getReviews();

    postReviewCtrl.checkCurrUser = function(id) {
      if(id === currUserID)
        return true;
    }

    postReviewCtrl.addTag = function(val) {
      postReviewCtrl.tags.push(val.toLowerCase());
      postReviewCtrl.tag = '';
    }

    postReviewCtrl.removeTag = function(idx) {
      postReviewCtrl.tags.splice(idx, 1);
    }

    postReviewCtrl.addReview = function() {
      if(!postReviewCtrl.content || postReviewCtrl.content === '' || postReviewCtrl.score === 0 || postReviewCtrl.tags.length === 0)
        return;

      var promise = ReviewService.addReview(postReviewCtrl.content, postReviewCtrl.score, postReviewCtrl.techInfo, postReviewCtrl.tags);

      promise.then(function(response) {
        if(postReviewCtrl.allTechInfo.length !== 0)
          postReviewCtrl.allTechInfo[techService.index].totalReviews += 1;
        $state.go('home');
        // postReviewCtrl.content = '';
        // postReviewCtrl.score = 0;
      })
      .catch(function(error) {
        console.log(error);
        postReviewCtrl.content = '';
        postReviewCtrl.score = 0;
      });


    }

    var arrPromise = ReviewService.getCurrVotedReview();
    arrPromise.then(function(response) {
      postReviewCtrl.arrEle = response.data[0].votedReview;
      postReviewCtrl.techFollow = response.data[0].techFollow;
      postReviewCtrl.followees = response.data[0].followees;
      postReviewCtrl.bookmarks = response.data[0].bookmarks;
      }).catch(function(error) {
      console.log(error);
    });

    postReviewCtrl.check = function(id, arr) {
      function checkitem(ele) {
        return ele === id;
      }
      if(arr.length !== 0)
        return arr.find(checkitem);
      else
        return false;
    }

    postReviewCtrl.upvote = function(review) {
      if(ReviewService.upvote(review))
        postReviewCtrl.arrEle.push(review._id);
    }

    postReviewCtrl.downvote = function(review) {
      if(ReviewService.downvote(review))
        postReviewCtrl.arrEle.push(review._id);
    }

    postReviewCtrl.options = {
      buttonLabels: 'fontawesome',
      toolbar: {
        buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote', 'pre', 'orderedlist', 'unorderedlist']
      }
    }

    postReviewCtrl.formatContent = function(content) {
      if(content.length < 300) {
        return content;
      } else {
        var str = content.slice(0,280);
        str += '. . .';
        return str;
      }
    }

    postReviewCtrl.addFollower = function(id) {
      if(techService.addFollower(id)) {
        postReviewCtrl.techFollow.push(id);
      }
    }

    postReviewCtrl.removeFollower = function(id) {
      if(techService.removeFollower(id)) {
        var idx = postReviewCtrl.techFollow.indexOf(id);
        postReviewCtrl.techFollow.splice(idx, 1);
        if(postReviewCtrl.techFollow.length < 3)
          $state.go('home2');
      }
    }

    postReviewCtrl.addBookmark = function(id) {
      if(UserService.addBookmark(id)) {
        postReviewCtrl.bookmarks.push(id);
        authService.bookmarksLength = postReviewCtrl.bookmarks.length;
      }
    }

    postReviewCtrl.removeBookmark = function(id) {
      if(UserService.removeBookmark(id)) {
        var idx = postReviewCtrl.bookmarks.indexOf(id);
        postReviewCtrl.bookmarks.splice(idx, 1);
        authService.bookmarksLength = postReviewCtrl.bookmarks.length;
      }
    }

    // postReviewCtrl.checkLength = function(len, id) {
    //   if(len == 0) {
    //     console.log('ji');
    //   } else {
    //     $window.location.href = '#/tech/'+id;
    //   }
    // }

    postReviewCtrl.state = $state;

  }


  ResultCtrl.$inject = ['techService', 'results', 'allTags', '$window', '$state'];
  function ResultCtrl(techService, results, allTags, $window, $state) {
    var resultCtrl = this;
    resultCtrl.allTech = results.data;
    resultCtrl.allTags = allTags.data;

    resultCtrl.selectedTags = [];

    resultCtrl.checkZero = function(val) {
      if(val==0)
        return false;
      else
        return true;
    }

    resultCtrl.checkTag = function(tag) {
      var tagIndex = resultCtrl.selectedTags.indexOf(tag);
      if(tagIndex == -1) {
        return false;
      } else {
        return true;
      }
    }

    if(resultCtrl.allTech.length == 0)
      resultCtrl.msg = true;
    else {
      resultCtrl.msg = false;
    }

    resultCtrl.getTagResult = function(tag) {
      var tagIndex = resultCtrl.selectedTags.indexOf(tag);
      if(tagIndex == -1) {
        resultCtrl.selectedTags.push(tag);
      } else {
        resultCtrl.selectedTags.splice(tagIndex, 1);
      }

      var resPromise = techService.getTagResult(resultCtrl.selectedTags);
      resPromise.success(function(data) {
        if(data.length == 0)
          resultCtrl.msg = true;
        else {
          resultCtrl.msg = false;
        }
       resultCtrl.allTech = data;
      });
    }

  }

  UserCtrl.$inject = ['userReviews', 'UserService', 'currentUser', 'selectedUser'];
  function UserCtrl(userReviews, UserService, currentUser, selectedUser) {
    var userctrl = this;
    var currUserID = currentUser[0]._id;
    var followees = currentUser[0].followees;
    userctrl.currFlag = true;
    userctrl.followFlag = false;

    userctrl.selectedUser = selectedUser[0];

    for(let i=0; i<followees.length; i++) {
      if(followees[i] == userctrl.selectedUser._id) {
        userctrl.followFlag = true;
        break;
      }
    }

    userctrl.formatContent = function(content) {
      if(content.length < 300) {
        return content;
      } else {
        var str = content.slice(0,280);
        str += '. . .';
        return str;
      }
    }

    if(currUserID === userctrl.selectedUser._id) {
      userctrl.currFlag = false;
    }
    userctrl.userReviews = userReviews;

    userctrl.addFollower = function(id) {
      userctrl.followFlag = UserService.addFollower(id);
    }

    userctrl.removeFollower = function(id) {
      userctrl.followFlag = !(UserService.removeFollower(id));
    }

    userctrl.checkCurrUser = function(id) {
      if(id === currUserID)
        return true;
      return false;
    }
  }

  NavCtrlFunc.$inject = ['authService', '$state', '$location'];
  function NavCtrlFunc(authService, $state, $location) {
    var navCtrl = this;
    navCtrl.state = $state;
    navCtrl.isLoggedIn = authService.isLoggedIn;
    navCtrl.currentUser = authService.currentUser;
    navCtrl.currentUserID = authService.currentUserID;
    navCtrl.logOut = authService.logOut;

    navCtrl.getActiveClass = function(path) {
      var arr = $location.path().split('/');
      if(arr[1] == path) {
        return 'color-red';
      }
    }

  }

  EditReviewCtrl.$inject = ['EditReviewService', 'review', '$state'];
  function EditReviewCtrl(EditReviewService, review, $state) {
    var editReviewCtrl = this;
    editReviewCtrl.review = review.data[0].review;
    editReviewCtrl.tags = review.data[0].tags;
    editReviewCtrl.techInfo = review.data[0].technology;
    var oldRating = review.data[0].review.rating;

    editReviewCtrl.editReview = function() {
      if(!editReviewCtrl.review.body || editReviewCtrl.review.body === '' || editReviewCtrl.review.rating === 0)
        return;

      var promise = EditReviewService.editReviewfunc(editReviewCtrl.review.body, editReviewCtrl.review.rating, editReviewCtrl.techInfo, oldRating);

      promise.then(function(response) {
        $state.go('home');
      })
      .catch(function(error) {
        console.log(error)
      });
    }

    editReviewCtrl.options = {
      buttonLabels: 'fontawesome',
      toolbar: {
        buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote', 'pre', 'orderedlist', 'unorderedlist']
      }
    }
  }

  ReviewCtrl.$inject = ['reviewInfo', 'CommentService'];
  function ReviewCtrl(reviewInfo, CommentService) {
    var reviewCtrl = this;

    reviewCtrl.info = reviewInfo[0];

    reviewCtrl.addComment = function() {
      CommentService.addComment(reviewCtrl.comment, reviewCtrl.info._id)
        .success(function(comment) {
          reviewCtrl.info.comments.push(comment);
        });
      reviewCtrl.comment = '';
    }
  }

})();
