var jwt     = require('jwt-simple');
var config  = require('../config/database');
var User    = require('../models/user');

exports.isAuthenticated = function(req, res, next) {
  var token = getToken(req.headers);

  if (token) {
    var decoded = jwt.decode(token, config.secret);
    if (decoded.exp <= Date.now()) {
      return res.status(403).send({
        message: 'Access token is expired.'
      });
    }
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({
          message: 'Authentication failed. User not found.'
        });
      } else {
        req.user = user;
        return next();
      }
    });
  } else {
    return res.status(403).send({
      message: 'No token provided.'
    });
  }
};

exports.isSuperUser = function(req, res, next) {
  try {
    console.log(req.user);
    if (req.user.superUser == true) {
      return next();
    } else {
      return res.status(403).send({
        message: 'Must be Super User.'
      });
    }
  } catch (e) {
    console.log(e);
    res.send(500);
  }
};

getToken = function(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
