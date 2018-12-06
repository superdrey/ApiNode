var jwt = require('jwt-simple');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var config = require('../config/database');
var User = require('../models/user');

exports.getUsers = function (req, res) {
    User.find({}, function (err, users) {
        if (!err) {
            return res.status(200).send(users);
        } else {
            console.error(err);
            return res.status(500).send(err);
        }
    });
};

exports.postUser = function (req, res) {
    if (!req.body.name || !req.body.password || !req.body.email) {
        return res.status(403).send({
            message: 'Please pass name, password.'
        });
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
	    email: req.body.email,
            superUser: false,
            resetPasswordToken: ""
        });
        newUser.save(function (err) {
            if (err) {
		console.log(err);
                return res.status(403).send({
                    message: 'Username already exists.'
                });
            }
            return res.status(200).send({
                message: 'Successful created new user.'
            });
        });
    }
};

exports.currentUser = function (req, res) {
    try {
        return res.status(200).send({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            superUser: req.user.superUser
        });
    } catch (e) {
        console.log(e);
        return res.send(500);
    }
};

exports.getUserById = function (req, res) {
    try {
        User.findById(req.params.id, function (err, user) {
            if (!err) {
                if (user) {
                    return res.status(200).send({
                        id: req.user._id,
                        name: req.user.name,
                        email: req.user.email,
                        superUser: req.user.superUser
                    });
                } else {
                    return res.status(404).send({
                        message: 'User ' + req.params.id + ' was not found'
                    });
                }
            } else {
                res.status(500).send(err);
            }
        });
    } catch (e) {
        console.log(e);
        return res.send(500);
    }
};

CryptPassword = function (id, user, password) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return err;
        }
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                return err;
            }
            user.password = hash;
            console.log("user.password : " + user.password);
            User.updateUser(id, user, {}, function (err, user) {
                if (err) {
                    throw err;
                }
            });
        });
    });
    return 0;
};

exports.patchUserById = function (req, res) {
    User.findOne({_id: req.params.id}, function (err, user) {
        if (!user) {
            return res.status(403).send({
                message: 'User ' + req.params.id + ' was not found'
            });
        }
        user.name = req.body.name;
        user.email = req.body.email;
        user.superUser = req.body.superUser;
        if (CryptPassword(req.params.id, user, req.body.password) === 0) {
            return res.status(200).send({
                message: 'User updated.'
            })
        }
        else {
            return res.status(403).send({
                message: 'Can\'t update user.'
            })
        }
    });
};

exports.patchCurrentUser = function (req, res) {
    User.findOne({_id: req.user._id}, function (err, user) {
        if (!user) {
            return res.status(403).send({
                message: 'User ' + req.user._id + ' was not found'
            });
        }
        user.name = req.body.name;
        user.password = req.body.password;
        user.email = req.body.email;
        if (CryptPassword(req.user._id, user, req.body.password) === 0) {
            return res.status(200).send({
                message: 'User updated.'
            });
        }
        else {
            return res.status(403).send({
                message: 'Can\'t update user.'
            })
        }
    });
};

getToken = function (headers) {
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

exports.forgot = function (req, res) {
    User.findOne({email: req.body.email}, function (err, user) {
        if (!user) {
            return res.status(403).send({
                message: 'No account with that email address exists.'
            });
        }
        var token = crypto.randomBytes(64).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        var link = 'http://' + req.headers.host + '/api/reset/' + user.resetPasswordToken;
        User.updateUser(user.id, user, {}, function (err, user) {
            if (err) {
                throw err;
            }
        });
        if (!token || !link) {
            return res.status(403).send({
                message: 'Link failed.'
            });
        }
        return res.status(200).send({
            token: link
        })
    });
};

exports.reset = function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            return res.status(403).send({
                message: 'Invalid link.'
            });
        }
        var pwd = Math.random().toString(36).substr(2, 8);
        user.password = pwd;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        if (CryptPassword(user._id, user, pwd) === 0) {
            return res.status(200).send({
                password: pwd
            });
        }
    });
};

exports.login = function (req, res) {
    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            return res.status(403).send({
                message: 'Authentication failed. User not found.'
            });
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    var token = jwt.encode(user, config.secret);
                    return res.status(200).send({
                        token: 'Bearer ' + token
                    });
                } else {
                    return res.status(403).send({
                        message: 'Authentication failed. Wrong password.'
                    });
                }
            });
        }
    });
};

exports.deleteUser = function(req, res) {
    User.remove({_id: req.params.id}, function (err, user) {
        if (!user) {
            return res.status(403).send({
                message: 'user ' + req.params.id + 'was not found'
            });
        }
        if (req.params.id) {
            return res.status(200).send ({
                message: 'user delete.'
            })
        }
        else {
            return res.status(403).send({
                message: 'can\'t update user.'
            })
        }
    });
};


exports.removeUser = function (id, callback) {
    var query = {_id: id};
    User.remove(query, callback);
};
