var mongoose = require('mongoose');

mongoose.model('User', require('./Users'));
mongoose.model('Post', require('./Posts'));
mongoose.model('Comment', require('./Comments'));
mongoose.model('Review', require('./Reviews'));
mongoose.model('Technology', require('./Technologies'));