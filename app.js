var express    = require('express'),
    bodyParser = require('body-parser'),
    mongoose   = require('mongoose'),
    session    = require('client-sessions'),
    bcrypt     = require('bcryptjs'),
    csrf       = require('csurf');

mongoose.connect('mongodb://192.168.33.30/svcc');

var app = express();

app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ 'extended' : true }));

app.use(bodyParser.urlencoded({ 'extended' : true }));

app.use(session({
  cookieName:     'session',
  secret:         'really_long_random_string',  // signing/ecrypting cookies
  duration:       30 * 60 * 1000,  // delete after 30 min (in ms)
  activeDuration: 5 * 60 * 1000    // extend the session 5 min if active
}));

app.use(csrf());

app.use(function(req,res,next) {
  if (req.session && req.session.user) {
    User.findOne({email: req.session.user.email}, function(err,user) {
      if (user) {
        createSession(req,res,user);
      }
      next();
    });
  } else {
    next(); // if no session is available, do nothing
  }
});

function requireLogin (req, res, next) {
  // if not logged in
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

function createSession (req, res, user) {
  var cleanUser = {
    firstName: user.firstName,
    lastName:  user.lastName,
    email:     user.email
  }
  req.session.user = cleanUser;
  req.user = cleanUser;
  res.locals.user = cleanUser;
}

app.get('/', function(req,res) {
  res.render('index.jade');
});

app.post('/register', function(req,res) {
  var salt = bcrypt.genSaltSync(10); // prevent rainbow attacks
  var hash = bcrypt.hashSync(req.body.password,salt);

  var user = new User({
    firstName: req.body.firstName,
    lastName:  req.body.lastName,
    email:     req.body.email,
    password:  hash
  });
  user.save(function(err) {
    if (err) {
      var error = 'Something bad happened! Please try again.';
      // 11000 - mongodb duplicate entry
      if (err.code === 11000) {
        error = 'That email is already taken, please try another.';
      }
      res.render('register.jade', { error: error });
    } else {
      res.redirect('/dashboard');
    }
  });
});

app.get('/register', function(req,res) {
  res.render('register.jade', {csrfToken: req.csrfToken()});
});

app.post('/login', function(req,res) {
  User.findOne({email: req.body.email}, function(err,user) {
    if (err) {
      res.render('login.jade', {error: 'Incorrect email/password'});
    } else if (user) {
      if (bcrypt.compareSync(req.body.password,user.password)) {
        createSession(req,res,user);
        res.redirect('/dashboard');
      } else {
        res.render('login.jade', {error: 'Incorrect email/password'});
      }
    } else {
      res.render('login.jade', {error: 'Incorrect email/password'});
    }
  });
});

app.get('/login', function(req,res) {
  res.render('login.jade', {csrfToken: req.csrfToken()});
});

app.get('/logout', function(req,res) {
  if (req.session) {
    req.session.reset();
  }
  res.redirect('/');
});

// require login
app.get('/dashboard', requireLogin, function(req,res) {
  res.render('dashboard.jade');
});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = mongoose.model('User', new Schema({
  id:        ObjectId,
  firstName: String,
  lastName:  String,
  email:     { type: String, unique: true },
  password:  String
}));

app.listen(3000);
