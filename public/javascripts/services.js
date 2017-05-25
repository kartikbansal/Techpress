var app = angular.module('techpress');

app.service("authService", authService);
app.service("fbAPIService", fbAPIService);
app.service("techService", techService);
app.service("ReviewService", ReviewService);
app.service("UserService", UserService);
app.service("EditReviewService", EditReviewService);
app.service("CommentService", CommentService);

authService.$inject = ['$http', '$window', '$state'];
function authService($http, $window, $state) {
  var auth = this;

  auth.saveToken = function(token) {
    $window.localStorage['techpress-token'] = token;
  }

  auth.getToken = function (){
    return $window.localStorage['techpress-token'];
  }

  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.name;
    }
  };

  auth.currentUserID = function() {
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload._id;
    }
  }

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  // auth.fblogin = function(user) {
  //   return $http({
  //     method: 'POST',
  //     url: '/fblogin',
  //     data: user,
  //     contentType: "application/json"}).success(function(data){
  //     auth.saveToken(data.token);
  //   });
  // }

  auth.logOut = function(){
    // FB.getLoginStatus(function(response) {
    //   if (response.status === 'connected') {
    //     FB.logout();
    //   }
      $window.localStorage.removeItem('techpress-token');
      $window.localStorage.removeItem('first-time');
      $state.go('login');
    // });

  };

}


fbAPIService.$inject = ['$q'];
function fbAPIService($q) {
  var fbService = this;

  fbService.fbLogin = function() {
    var deferred = $q.defer();
    FB.api('/me', {
      fields: 'name, email'
    }, function(response) {
      if (!response || response.error) {
        deferred.reject('Error occured');
      } else {
        deferred.resolve(response);
      }
    });
    return deferred.promise;
  }
}

techService.$inject = ['$http', 'authService'];
function techService($http, authService) {
	var techService = this;

  var allTechInfo = [];

	techService.getAll = function() {

    if(allTechInfo.length == 0) {
      return $http({
  			method: 'GET',
  			url: '/technology',
  		}).success(function(data) {
        angular.copy(data, allTechInfo);
        return data;
      });
    }
	}

  techService.getAllResults = function() {
    return $http({
			method: 'GET',
			url: '/technology',
		}).success(function(data) {
      return data;
    });
	}

  techService.getAllTags = function() {
    return $http({
      method: 'GET',
      url: '/tags',
    }).success(function(data) {
      return data;
    });
  }

  techService.getTagResult = function(keys) {
    if(keys.length !== 0) {
      return $http({
        method: 'GET',
        url: '/tagresult',
        params: {
          tags: keys
        }
      });
    } else {
      return $http({
        method: 'GET',
        url: '/technology',
      });
    }
  }

  techService.techItem = [];

	techService.getById = function(id, idx) {
    techService.index = idx;
		return $http({
			method: 'GET',
			url: '/technology',
			params: {
				_id: id
			}
		}).success(function(data) {
      techService.techItem = data;
    });
	}

  techService.getTechInfo = function() {
    return allTechInfo;
  }

  techService.addFollower = function(id) {
    return $http({
      method: 'PUT',
      url: '/tech/' + id + '/follow',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

  techService.removeFollower = function(id) {
    return $http({
      method: 'PUT',
      url: '/tech/' + id + '/unfollow',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

}

ReviewService.$inject = ['$http', 'authService', '$state'];
function ReviewService($http, authService, $state) {
	var reviewService = this;

  var allReviews = [];

  reviewService.getAllReviews = function() {
    return $http({
      method: 'GET',
      url: '/reviews'
    }).success(function(data) {
      angular.copy(data, allReviews);
    });
  }

  reviewService.getTopTen = function() {
    return $http({
      method: 'GET',
      url: '/reviews',
      params: {
        topten: true
      }
    }).success(function(data) {
      angular.copy(data, allReviews);
    });
  }

  reviewService.getAllBookmarks = function() {
    return $http({
      method: 'GET',
      url: '/reviews',
      params: {
        currUserID: authService.currentUserID(),
        bookmarks: true
      }
    }).success(function(data) {
      angular.copy(data, allReviews);
    });
  }

  reviewService.getAllReviewsForTag = function(tag) {
    return $http({
      method: 'GET',
      url: '/tag/reviews',
      params: {
        tag: tag
      }
    }).success(function(data) {
      angular.copy(data, allReviews);
    });
  }

  reviewService.getAll = function() {
    return $http({
      method: 'GET',
      url: '/reviews',
      params: {
        currUserID: authService.currentUserID()
      }
    }).success(function(data) {
      if(data.length == 0) {
        $state.go('home2');
      } else {
        angular.copy(data, allReviews);
      }
    });
  }

  reviewService.getAllTech = function(id) {
    return $http({
      method: 'GET',
      url: '/reviews',
      params: {
        techID: id
      }
    }).success(function(data) {
      angular.copy(data, allReviews);
    });
  }

  reviewService.getReviews = function() {
    return allReviews;
  }

  reviewService.addReview = function(content, rating, techInfo, tags) {
    var reviewDoc = {
      review: {
        body: content,
        rating: rating
      },
      technology: {
        name: techInfo.name,
        techID: techInfo._id
      },
      tags: tags
    }

    return $http({
      method: 'POST',
      url: '/reviews',
      data: reviewDoc,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    });

  }

  reviewService.upvote = function(review) {
    return $http({
      method: 'PUT',
      url: '/reviews/' + review._id + '/upvote',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

  reviewService.downvote = function(review) {
    return $http({
      method: 'PUT',
      url: '/reviews/' + review._id + '/downvote',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

  reviewService.getCurrVotedReview = function() {
    return $http({
      method: 'GET',
      url: '/user',
      params: {
        _id: authService.currentUserID()
      }
    });
  }

  reviewService.getPost = function(id) {
    return $http({
      method: 'GET',
      url: '/post/' + id,
    });
  }

}

EditReviewService.$inject = ['$http', 'authService'];
function EditReviewService($http, authService) {
  var editReview = this;
  // var review = {};
  // var getReview = function() {
  //   return review;
  // }
  editReview.getReview = function(id) {
    return $http({
      method: 'GET',
      url: '/currreview',
      params: {
        userID: authService.currentUserID(),
        techID: id
      }
    }).success(function(data) {
      return data;
    });
  }

  editReview.editReviewfunc = function(content, rating, techInfo, oldRating, tags) {
    var reviewDoc = {
      body: content,
      rating: rating,
      id: techInfo.techID._id,
      oldRating: oldRating,
      tags: tags
    }

    var response = $http({
      method: 'PUT',
      url: '/currreview',
      data: reviewDoc,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    });

    return response;
  }
}


CommentService.$inject = ['$http', 'authService'];
function CommentService($http, authService) {
  var commentService = this;

  commentService.addComment = function(body, id) {
    var comment = {
      body: body,
      user: {
        userId: authService.currentUserID(),
        name: authService.currentUser()
      }
    }
    return $http({
      method: 'POST',
      url: '/review/'+id+'/comments',
      data: comment,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    });
  }
}


UserService.$inject = ['authService', '$http'];
function UserService(authService, $http) {
  var userService = this;
  userService.getUser = function(id) {
    if(!id) {
      return $http({
        method: 'GET',
        url: '/user',
        params: {
          _id: authService.currentUserID()
        }
      });
    } else {
      return $http({
        method: 'GET',
        url: '/user',
        params: {
          _id: id
        }
      });
    }
  }

  userService.getUserDetails = function(id) {
    return $http({
      method: 'GET',
      url: '/reviews',
      params: {
        userID: id
      }
    });
  }

  userService.addFollower = function(id) {
    return $http({
      method: 'PUT',
      url: '/user/' + id + '/follow',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

  userService.removeFollower = function(id) {
    return $http({
      method: 'PUT',
      url: '/user/' + id + '/unfollow',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

  userService.addBookmark = function(id) {
    return $http({
      method: 'PUT',
      url: '/user/' + id + '/addBookmark',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

  userService.removeBookmark = function(id) {
    return $http({
      method: 'PUT',
      url: '/user/' + id + '/removeBookmark',
      data: null,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    }).success(function(data) {
      return true;
    });
  }

}
