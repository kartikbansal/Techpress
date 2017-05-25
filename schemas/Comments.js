var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  user: {
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: {type: String},
    image: {type: String, default: '/images/default_user.png'},
  },
  body: {type: String},
  time: {type: Date, default: Date.now}
});

module.exports = CommentSchema;
