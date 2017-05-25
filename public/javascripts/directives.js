var app = angular.module('techpress');

app.directive("rating", ratingDirective);

function ratingDirective() {

	var ddo = {
		restrict: 'AE',
		scope: {
			score: '=score',
			max: '=max'
		},
		templateUrl:'/templates/rating.html',
		link: function(scope, elements, attr) {

			scope.updateStars = function() {
				var idx = 0;
				scope.stars = [];
				for(idx = 0; idx < scope.max; idx++) {
					scope.stars.push({
						full: scope.score > idx
					});
				}
			};

			scope.starClass = function(star, idx) {
			  var starClass = 'fa-star-o';
			  if (star.full) {
			    starClass = 'fa-star';
			  }
			  return starClass;
			};

			scope.$watch('score', function(newValue, oldValue) {
			  if (newValue !== null && newValue !== undefined) {
			    scope.updateStars();
			  }
			});

			scope.setRating = function(idx) {
				scope.score = idx+1;
			}

		}
	};

	return ddo;
}


// function allTechDirective() {
// 	var ddo = {
// 		restrict: 'AE',
// 		scope: {},
// 		controller: TechnologyCtrl,
// 		bindToController: true,
// 		controllerAs: 'technologyCtrl',
// 		templateUrl: '/templates/allTech.html'
// 	};
//
// 	return ddo;
// }
