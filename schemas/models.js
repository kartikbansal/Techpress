var mongoose = require('mongoose');

mongoose.model('User', require('./Users'));
mongoose.model('Review', require('./Reviews'));
mongoose.model('Technology', require('./Technologies'));