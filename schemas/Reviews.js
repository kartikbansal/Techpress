var mongoose = require('mongoose');

var ReviewSchema = new mongoose.Schema({
	userID: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
	time: {type: Date, default: Date.now},
	review: {
		title: {type: String, required: true},
		body: {type: String, required: true},
		source: {type: String, required: true},
		rating: {type: Number, required: true}
	},
	technology: {
		name: {type: String, required: true},
		techID: {type: mongoose.Schema.Types.ObjectId, ref: 'Technology', required: true}
	},
	reputation: {type: Number}
});

ReviewSchema.methods.upvote = function(cb) {
	this.reputation += 0.4;
	this.save(cb);
};

ReviewSchema.methods.downvote = function(cb) {
	this.reputation -= 0.5;
	this.save(cb);
};

module.exports = ReviewSchema;