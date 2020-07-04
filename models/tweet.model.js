'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tweetSchema = Schema({
    info: String
});

module.exports = mongoose.model('tweet', tweetSchema);