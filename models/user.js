var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
   email: {
       type: String,
       unique: false,
       required: false
    },
    superUser: {
        type: Boolean,
        required: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.updateUser = function (id, user, options, callback) {
    var query = {_id: id};
    var update = {
        name: user.name,
        password: user.password,
        email: user.email,
        superUser: user.superUser,
        resetPasswordToken: user.resetPasswordToken,
        resetPasswordExpires: user.resetPasswordExpires
    };
    User.findOneAndUpdate(query, update, options, callback);
};
