var app = angular.module('techpress');

app.service("authService", authService);
app.service("fbAPIService", fbAPIService);
app.service("techService", techService);
app.service("ReviewService", ReviewService);
app.service("PostsService", PostsService);
app.service("UsersService", UsersService);

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
      //console.log(payload);
      return payload.name;
    }
  };

  auth.currentUserID = function() {
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      //console.log(payload);
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

  auth.fblogin = function(user) {
    return $http({
      method: 'POST',
      url: '/fblogin', 
      data: user, 
      contentType: "application/json"}).success(function(data){
      auth.saveToken(data.token);
    });
  }

  auth.logOut = function(){
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        FB.logout();
      }
      $window.localStorage.removeItem('techpress-token');
      $state.go('login');
    });
    
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

techService.$inject = ['$http'];
function techService($http) {
	var techService = this;

	techService.getAll = function() {
		return $http({
			method: 'GET',
			url: '/technology',
		});
	}

  techService.techItem = [];

	techService.getById = function(id) {
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

}

ReviewService.$inject = ['$http', 'authService'];
function ReviewService($http, authService) {
	var reviewService = this;

  var allReviews = [];

  reviewService.getAll = function() {
    return $http.get('/reviews').success(function(data) {
      angular.copy(data, allReviews);
    });
  }

  reviewService.getReviews = function() {
    return allReviews;
  }

  reviewService.addReview = function(title, body, source, rating,techInfo) {
    var reviewDoc = {
      review: {
        title: title,
        body: body,
        source: source,
        rating: rating
      },
      technology: {
        name: techInfo.name,
        techID: techInfo._id
      }
    }

    var response = $http({
      method: 'POST',
      url: '/reviews',
      data: reviewDoc,
      headers: {Authorization: 'Bearer '+ authService.getToken()}
    });

    return response;
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

  reviewService.getBestSource = function() {
    return $http({
      method: 'GET',
      url: '/best_review',
    });
  }
}


PostsService.$inject = ['$http', 'authService'];
function PostsService($http, authService) {
  var service = this;
  var posts = [];

  service.getAll = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, posts);
    });
  }

  service.getPosts = function() {
    return posts;
  }

  service.addPost = function(title, link) {
    var post = {
      title: title, 
      link: link
    }

    return $http.post('/posts', post, {headers: {Authorization: 'Bearer '+ authService.getToken()}}).success(function(data) {
      posts.push(data);
    });

  }

  service.incrementUpvotes = function(post) {
    return $http.put('/posts/' + post._id + '/upvote', null, { headers: { Authorization: 'Bearer '+ authService.getToken() }}).success(function(data) {
      post.upvotes++;
    });
  }

  service.getPostById = function(id) {
    return $http.get('/posts/' + id).then(function(res) {
      return res.data;
    });
  }

  service.addComment = function(post, body) {
    var comment = {
      body: body,
      author: 'user'
    }

    return $http.post('/posts/' + post._id + '/comments', comment,  { headers: {Authorization: 'Bearer '+ authService.getToken() }}).success(function(comment) {
      post.comments.push(comment);
    });
  }

  service.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null,  { headers: {Authorization: 'Bearer '+ authService.getToken() }}).success(function(data) {
      comment.upvotes++;
    });
  }

}


UsersService.$inject = ['authService', '$http'];
function UsersService(authService, $http) {
  var usersService = this;
  // var id = 
  usersService.getUser = function() {
    return $http({
      method: 'GET',
      url: '/user',
      params: {
        _id: authService.currentUserID()
      }
    });
  }
}

