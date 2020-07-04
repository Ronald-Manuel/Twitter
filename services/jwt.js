'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'TwitterJS';

exports.createToken = (user) => {
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(24, "hours").unix()
    };
    return jwt.encode(payload, key);
}