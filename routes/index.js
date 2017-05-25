'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var config = require('../config/devConfig.js');

var User = mongoose.model('User');
var Review = mongoose.model('Review');
var Technology = mongoose.model('Technology');
var TechnologyTag = mongoose.model('TechnologyTag');
var Comment = mongoose.model('Comment');

var auth = jwt({secret: config.secret_key, userProperty: 'payload'});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.post('/register', function(req, res, next) {
	if(!req.body.email || !req.body.email) {
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	var user = new User();
	user.email = req.body.email;
	user.fullName = req.body.fullName;
	user.setPassword(req.body.password);
	user.save(function(err) {

		if(err) {
      return next(err);
    }
		return res.json({token: user.generateJWT()});
	});
});

router.post('/login', function(req, res, next) {
	if(!req.body.email || !req.body.password) {
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info) {
		if(err) return next(err);
		if(user) {
			return res.json({token: user.generateJWT()});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

// router.post('/fblogin', function(req, res, next) {

// 	if(!req.body.email) {
// 		return res.status(400).json({message: 'Please fill out all fields'});
// 	}

// 	User.findOne({email: req.body.email}, function(err, user) {
// 		if(user) {
// 			return res.json({token: user.generateJWT()});
// 		}
// 		else {
// 			var user = new User();
// 			user.email = req.body.email;
// 			user.fullName = req.body.fullName;
// 			user.save(function(err) {
// 				if(err) return next(err);

// 				return res.json({token: user.generateJWT()});
// 			});
// 		}
// 	});
// });




/****** GET TECHNOLOGY ******/
router.get('/technology', function(req, res, next) {
	var query = null;
	if(req.query._id !== undefined) {
		query = Technology.find({_id: req.query._id});
	} else {
		query = Technology.find({});
	}
	query
	.exec(function(err, technologies) {
		if(err) return next(err);
		res.json(technologies);
	});
});

router.param('tech', function(req, res, next) {
	Technology.findById(id)
	.exec(function(err, technology) {
		if(err) return next(err);
		if(!technology) return next(new Error('can\'t find technology'));
		req.technology = technology;
		return next();
	});
});


/****** GET REVIEW *******/
router.get('/reviews', function(req, res, next) {
  function queryExec(query) {
    query
  	.populate('userID', 'fullName _id votedReview image followees')
  	.populate('technology.techID', 'image')
  	.exec(function(err, reviews) {
  		if(err) return next(err);
      //result = user + reviews;
      //console.log(reviews);
  		return res.json(reviews);
  	});
  }

	var query = null;
  var result = null;
	if(req.query.userID !== undefined) {
		query = Review.find({userID: req.query.userID});
    queryExec(query);
	} else if(req.query.topten) {
    query = Review.find({"time": {$gte: (new Date((new Date()).getTime() - (7 * 24 * 60 * 60 * 1000)))}}).sort({reputation: -1}).limit(10);
    queryExec(query);
  } else if(req.query.techID !== undefined) {
      query = Review.find({"technology.techID": req.query.techID});
      queryExec(query);
	  } else if(req.query.currUserID !== undefined) {
        User.findById(req.query.currUserID)
      	.exec(function(err, user) {
      		if(err) return next(err);
      		if(!user) return next(new Error('can\'t find review'));
          if(req.query.bookmarks) {
            query = Review.find({"_id": {$in: user.bookmarks}});
          } else {
    		    query = Review.find({$or: [ {"userID": {$in: user.followees}}, {"technology.techID": {$in: user.techFollow}}]});
          }
          queryExec(query);
    	  });
	    } else {
        query = Review.find({});
        queryExec(query);
      }
});

router.get('/tag/reviews', function(req, res, next) {
  var query = Review.find({"tags": {$elemMatch: {$eq: req.query.tag} }});
  query
  .populate('userID', 'fullName _id votedReview image followees')
  .populate('technology.techID', 'image')
  .exec(function(err, reviews) {
    if(err) return next(err);
    //result = user + reviews;
    //console.log(reviews);
    return res.json(reviews);
  });
});

router.get('/currreview', function(req, res, next) {
  var query = Review.find({"userID": req.query.userID, "technology.techID": req.query.techID});
	query
	.populate('technology.techID', 'image')
	.exec(function(err, review) {
		if(err) return next(err);
		return res.json(review);
	});
});

router.put('/currreview', auth, function(req, res, next) {
	var userid = req.payload._id;
	var doc = req.body;
	Review.findOneAndUpdate({"userID": userid, "technology.techID": doc.id}, {$set: {"review.body": doc.body, "review.rating": doc.rating}}, {new: true},function(err, review) {
		if(err) return next(err);
		Technology.findOneAndUpdate({"_id": doc.id}, {$inc: {reputation: review.reputation*(doc.rating-req.body.oldRating)}}, {new: true},function(err, tech) {
			if(err) return next(err);
      var bulk = TechnologyTag.collection.initializeOrderedBulkOp();
      for(var i=0; i<review.tags.length; i++) {
        bulk.find({ $and: [ {techID: tech._id}, {tag: review.tags[i]} ] })
          .upsert()
          .updateOne({$inc: {reputation: review.reputation*(doc.rating-req.body.oldRating)}});
      }
      bulk.execute(function(err, data) {
        res.json(review);
      });
		});
	});
});

// router.get('/post/:postId', function(req, res, next) {
//   // console.log(req.params.postId);
//   // res.end();
//   var query = Review.find({_id: req.params.postId});
//   query
//   .populate('userID', 'fullName _id image')
//   .populate('technology.techID', 'image')
//   .populate('comments')
//   .exec(function(err, post) {
//     if(err) return next(err);
//     res.json(post);
//   });
// });
//
// /****** POST COMMENTS *****/
// router.post('/post/:postId/comments', function(req, res, next) {
//   var comment = new Comment(req.body);
// });


/****** POST REVIEW *****/
router.post('/reviews', auth, function(req, res, next) {
	var review = new Review(req.body);
	review.userID = req.payload._id;
	User.find({"_id": review.userID}, function(err, user) {
     var user = user[0];
     if(err) return next(err);
     if(!user) return next(new Error('can\'t find user'));
  	 review.reputation = 1 + user.followersCount*0.1;
  	 review.save(function(err, post) {
  		 if(err) return next(err);
  		 Technology.findOneAndUpdate({"_id": post.technology.techID}, {$inc : {reputation: post.reputation*post.review.rating, totalWeight: post.reputation, totalReviews: 1}}, {'new': true}, function(err, tech) {
        if(err) return next(err);
        var bulk = TechnologyTag.collection.initializeOrderedBulkOp();
        for(var i=0; i<post.tags.length; i++) {
          bulk.find({ $and: [ {name: tech.name}, {techID: tech._id}, {image: tech.image}, {tag: post.tags[i]} ] })
            .upsert()
            .updateOne({$inc: {reputation: post.reputation*post.review.rating, totalWeight: post.reputation}});
        }
        bulk.execute(function(err, data) {
          res.json(review);
        });
  		});
  	});
  });
});


/*****	UPVOTE REVIEW ****/
router.param('review', function(req, res, next, id) {
	Review.findById(id)
	.exec(function(err, review) {
		if(err) return next(err);
		if(!review) return next(new Error('can\'t find review'));
		req.review = review;
		return next();
	})
});



router.put('/reviews/:review/upvote', auth, function(req, res, next) {
	req.review.upvote(function(err, reviewPost) {
		if(err) return next(err);
		Technology.findOneAndUpdate({"_id": reviewPost.technology.techID}, {$inc: {reputation: reviewPost.review.rating*0.4, totalWeight: 0.4}}, {'new': true}, function(err, tech) {
			User.findOneAndUpdate({"_id": req.payload._id}, {$push: {"votedReview": reviewPost._id}}, {safe: true, 'new': true}, function(err, user) {
				if(err) return next(err);
        var bulk = TechnologyTag.collection.initializeOrderedBulkOp();
        for(var i=0; i<reviewPost.tags.length; i++) {
          bulk.find({ $and: [ {techID: tech._id}, {tag: reviewPost.tags[i]} ] })
            .upsert()
            .updateOne({$inc: {reputation: reviewPost.review.rating*0.4, totalWeight: 0.4}});
        }
        bulk.execute(function(err, data) {
          res.json(reviewPost)
        });
			});
		});
	});
});

router.put('/reviews/:review/downvote', auth, function(req, res, next) {
	req.review.downvote(function(err, reviewPost) {
		if(err) return next(err);
		Technology.findOneAndUpdate({"_id": reviewPost.technology.techID}, {$inc: {reputation: reviewPost.review.rating*0.5*(-1), totalWeight: 0.5*(-1)}}, {'new': true}, function(err, tech) {
			User.findOneAndUpdate({"_id": req.payload._id}, {$push: {"votedReview": reviewPost._id}}, {safe: true, 'new': true}, function(err, user) {
				if(err) return next(err);
        var bulk = TechnologyTag.collection.initializeOrderedBulkOp();
        for(var i=0; i<reviewPost.tags.length; i++) {
          bulk.find({ $and: [ {techID: tech._id}, {tag: reviewPost.tags[i]} ] })
            .upsert()
            .updateOne({$inc: {reputation: reviewPost.review.rating*0.5*(-1), totalWeight: 0.5*(-1)}});
        }
        bulk.execute(function(err, data) {
          res.json(user.votedReview);
        });
			});
		});
	});
});


/******  GET ALL TAGS  ******/
router.get('/tags', function(req, res, next) {
  var query = TechnologyTag.distinct("tag");
  query.exec(function(err, tags) {
    if(err) return next(err);
    res.json(tags);
  });
});

/*****  GET TAG RESULT  ******/
router.get('/tagresult', function(req, res, next) {
  // var query = TechnologyTag.find({tag: req.query.tag});
  if(typeof(req.query.tags) === 'string') {
    var query = TechnologyTag.find({tag: req.query.tags});
    query
    .exec(function(err, results) {
      if(err) return next(err);

      res.json(results);
    });
  } else {
    var query = TechnologyTag.aggregate([
      {$match: {tag: {$in: req.query.tags}}},
      {$group: {_id: "$techID", name: {$first: '$name'}, image: {$first: '$image'}, reputation: {$sum: "$reputation"}, totalWeight: {$sum: "$totalWeight"}, numMatches: {$sum: 1}}},
      {$match: {numMatches: {$eq: req.query.tags.length}}}
    ]);
    query
    .exec(function(err, results) {
      if(err) return next(err);
      res.json(results);
    });
  }


});


/******  GET SINGLE POST  ******/
router.get('/post/:postId', function(req, res, next) {
  var query = Review.find({_id: req.params.postId});
  query
  .populate('userID', 'fullName _id image')
  .populate('technology.techID', 'image')
  .populate('comments')
  .exec(function(err, post) {
    if(err) return next(err);
    res.json(post);
  });
});

/******  POST COMMENTS ******/
router.post('/review/:review/comments', auth, function(req, res, next) {
  //console.log(req.body);
  var comment = new Comment(req.body);

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.review.comments.push(comment);
    req.review.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});


/******   FOLLOW TECH **********/
router.put('/tech/:techId/follow', auth, function(req, res, next) {
  User.findOneAndUpdate({"_id": req.payload._id}, {$push: {"techFollow": req.params.techId}}, {'new': true},function(err, user) {
			if(err) return next(err);
			res.json({flag: "success"});
	});
});

router.put('/tech/:techId/unfollow', auth, function(req, res, next) {
  User.findOneAndUpdate({"_id": req.payload._id}, {$pull: {"techFollow": req.params.techId}}, {'new': true},function(err, user) {
			if(err) return next(err);
			res.json({flag: "success"});
	});
});


/****** 	GET BEST SOURCE 	*****/
router.get('/best_review', function(req, res, next) {
	Review.aggregate([
		{
			$group: {
				_id: "$technology",
				maxrepo: { $max: "$reputation" }
			}
		},
		{ $project: {review: 1} }
	], function(err, result) {
		if(err) return next(err);
		res.json(result);
	});
});


/*****	GET USER ******/
router.get('/user', function(req, res, next) {
	var query = null;
	if(req.query._id !== undefined) {
		query = User.find({_id: req.query._id});
	} else {
		query = User.find({});
	}
	query
	.exec(function(err, user) {
		if(err) return next(err);
		res.json(user);
	});
});

router.param('user_id', function(req, res, next, id) {
	User.findById(id)
	.exec(function(err, user) {
		if(err) return next(err);
		if(!user) return next(new Error('can\'t find review'));
		req.user = user;
		return next();
	});
});

router.put('/user/:user_id/follow', auth, function(req, res, next) {
	User.findOneAndUpdate({"_id": req.payload._id}, {$push: {"followees": req.user._id}}, {'new': true},function(err, user) {
		req.user.follow(function(err, user) {
			if(err) return next(err);
			res.json({flag: "success"});
		});
	});
});

router.put('/user/:user_id/unfollow', auth, function(req, res, next) {
	User.findOneAndUpdate({"_id": req.payload._id}, {$pull: {"followees": req.user._id}}, {'new': true},function(err, user) {
		req.user.unfollow(function(err, user) {
			if(err) return next(err);
			res.json({flag: "success"});
		});
	});
});

router.put('/user/:review_id/addBookmark', auth, function(req, res, next) {
	User.findOneAndUpdate({"_id": req.payload._id}, {$push: {"bookmarks": req.params.review_id}}, {'new': true},function(err, user) {
		if(err) return next(err);
		res.json({flag: "success"});
	});
});

router.put('/user/:review_id/removeBookmark', auth, function(req, res, next) {
	User.findOneAndUpdate({"_id": req.payload._id}, {$pull: {"bookmarks": req.params.review_id}}, {'new': true},function(err, user) {
		if(err) return next(err);
		res.json({flag: "success"});
	});
});


module.exports = router;
