var mongoose = require('mongoose');

var TechSchema = new mongoose.Schema({
	name: {type: String, required: true, unique: true},
	reputation: {type: Number, default: 0},
	totalWeight: {type: Number, default: 0},
	image: {type: String, required: true}
});

module.exports = TechSchema;