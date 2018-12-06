var express     = require('express');
var app         = express();
var fs          = require('fs');
var multer      = require('multer');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cors        = require('cors');
var passport    = require('passport');
var jwt         = require('jwt-simple');
var config      = require('./config/database');
var User        = require('./models/user');
var authentication = require('./middleware/authentication');
var users        = require('./routes/users');

require('./config/passport')(passport);

//var key = fs.readFileSync('/etc/letsencrypt/live/pointeuse.ovh/privkey.pem');
//var cert = fs.readFileSync('/etc/letsencrypt/live/pointeuse.ovh/fullchain.pem' );

// var options = {
//     key: key,
//     cert: cert
// };

var corsOptions = {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
    credentials: true
};

app.use(cors(corsOptions));

var port = process.env.PORT || 8080;

mongoose.Promise = require('bluebird');
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(passport.initialize());

app.get('/', function(req, res) {
    res.send('Hello! The API is at https://localhost:' + port + '/api');
});

app.get('/users', authentication.isAuthenticated, authentication.isSuperUser, users.getUsers);
app.post('/users', authentication.isAuthenticated, authentication.isSuperUser, users.postUser);
app.get('/users/self', authentication.isAuthenticated, users.currentUser);
app.get('/users/:id', authentication.isAuthenticated, users.getUserById);
app.patch('/users/self', authentication.isAuthenticated, users.patchCurrentUser);
app.patch('/users/:id', authentication.isAuthenticated, authentication.isSuperUser, users.patchUserById);
app.delete('/users/:id', authentication.isAuthenticated, authentication.isSuperUser, users.deleteUser);
app.post('/api/login', users.login);
//app.post('/api/forgot', users.forgot);
//app.get('/api/reset/:token', users.reset);


var https = require('https');
https.createServer(options, app).listen(8443);
