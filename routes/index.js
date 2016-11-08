var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var config = require('../config/devConfig.js');

var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Review = mongoose.model('Review');
var Technology = mongoose.model('Technology');

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

		if(err) return next(err);
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

router.post('/fblogin', function(req, res, next) {

	if(!req.body.email) {
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	User.findOne({email: req.body.email}, function(err, user) {
		if(user)
			return res.json({token: user.generateJWT()});
		else {
			var user = new User();
			user.email = req.body.email;
			user.fullName = req.body.fullName;
			user.save(function(err) {
				if(err) return next(err);

				return res.json({token: user.generateJWT()});
			});
		}
	});
});




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
	Review.find({})
	.populate('userID', 'fullName _id votedReview image')
	.exec(function(err, reviews) {
		if(err) return next(err);
		return res.json(reviews);
	});
});


/****** POST REVIEW *****/
router.post('/reviews', auth, function(req, res, next) {
	var review = new Review(req.body);
	review.userID = req.payload._id;
	User.findOneAndUpdate({"_id": review.userID}, {$push: {"techflag": review.technology.name}}, function(err, user) {
			if(err) return next(err);
			if(!user) return next(new Error('can\'t find user'));
			review.reputation = 1 + user.followersCount*0.1;
			review.save(function(err, post) {
			if(err) return next(err);
			Technology.findOneAndUpdate({"_id": post.technology.techID}, {$inc : {reputation: post.reputation*post.review.rating, totalWeight: post.reputation}}, {'new': true}, function(err, tech) {
				res.json(review);
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
				res.json(reviewPost)
			});
		});
	});
});

router.put('/reviews/:review/downvote', auth, function(req, res, next) {
	req.review.downvote(function(err, reviewPost) {
		if(err) return next(err);
		Technology.findOneAndUpdate({"_id": reviewPost.technology.techID}, {$inc: {reputation: reviewPost.review.rating*0.5*(-1), totalWeight: 0.4*(-1)}}, {'new': true}, function(err, tech) {
			User.findOneAndUpdate({"_id": req.payload._id}, {$push: {"votedReview": reviewPost._id}}, {safe: true, 'new': true}, function(err, user) {
				if(err) return next(err);
				res.json(user.votedReview);
			});
		});
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


module.exports = router;
