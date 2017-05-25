var mongoose = require('mongoose');

var TechTagsSchema = new mongoose.Schema({
  techID: {type: mongoose.Schema.Types.ObjectId, ref: 'Technology', required: true},
  name: {type: String, required: true},
  image: {type: String, required: true},
	tag: {type: String, required: true},
	reputation: {type: Number, default: 0, min: 0},
	totalWeight: {type: Number, default: 0, min: 0}
},{
  toObject: {virtuals: true},
  toJSON: {virtuals: true}
});

// TechTagsSchema.virtual('name').get(function() {
//   return this.techID.name;
// });
//
// TechTagsSchema.virtual('image').get(function() {
//   return this.techID.image;
// });

module.exports = TechTagsSchema;
