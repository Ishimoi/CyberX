/**
 * Created by thomas on 01/06/16.
 */
var express = require('express');
var passport = require('passport');
var Body = require('body-parser');
var expressSession=require('express-session');
var cookie = require('cookie-parser');
var passportLocal = require('passport-local');
var path = require('path');
var app = express();
var logout = require('express-passport-logout');

app.use(Body());
app.use(cookie());
//app.use(logout());
app.use(expressSession({secret: "Jello"}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal.Strategy(function(username,password,done){
  if (username=="Whatisthe" && password=="Matrix") {
    console.log("Checking ");
    done(null, {user: username, password: 123});
  //console.log("Checking");
  }
  else
      done (null,'Error');
}));
app.set('view engine','ejs');
app.get('/', function (req, res) {

  if (req.isAuthenticated()) {
    console.log(req.user);
    res.render('Home', {isAuth: true, user: req.user.user, id: req.user.password});
  }
  else
      res.render('login')
});
passport.serializeUser(function(user,done){
  console.log("Serial "+ user);
    done(null,user);

});

passport.deserializeUser(function(user,done){
  done(null,user);

});

app.post('/',passport.authenticate('local'),function(req,res){
  res.redirect('/');
});
app.get('/logout', logout());
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

