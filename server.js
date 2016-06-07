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
var io = require('socket.io');
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var logout = require('express-passport-logout');
/*SocketServer.listen(3000,function () {
  console.log('socket listen ');

});
*/


app.use(Body());
app.use(cookie());
//app.use(logout());
app.use(expressSession({secret: "Jello"}));
app.use(passport.initialize());
app.use(passport.session());
console.log(__dirname);
passport.use(new passportLocal.Strategy(function(username,password,done){
  if (username=="admin" && password=="admin"){

    GetServerList(function(servers){
      console.log("res is "+JSON.stringify(servers));
      done(null,{user:"admin","ServerList":servers});

    });
  }
  else {
    DataBase(username, password,'user', function (err, res) {
      if (res)
        done(null, {user: username, password: 123});
      else {
        console.log('WHAT??');
        done(null, false);
      }
    });

    //console.log("Checking");
  }
  }));


app.set('view engine','ejs');
app.get('/serverdata',function(req,res){
  GetServerList(function(servers){
     res.json(servers);
  });
});
app.get('/', function (req, res) {

  if (req.isAuthenticated()) {
    //console.log(req.user);
    if (req.user.user=="admin"){
      //res.json({"ServerList":req.user.ServerList})
      res.render('admin');
      
    }
    else
      res.render('Home', {isAuth: true, user: req.user.user, id: req.user.password});
  }
  else
      res.redirect('/login');
});
passport.serializeUser(function(user,done){
  //console.log("Serial "+ user);
    done(null,user);

});

passport.deserializeUser(function(user,done){
  console.log("Serial "+ user);
  done(null,user);

});

app.post('/login',passport.authenticate('local',{ failureRedirect: '/login' }),function(req,res){
  console.log("req is:  \n\n"+req.user);
  res.redirect('/');
});
app.get('/logout',function(req,res){
  req.logout();
  res.redirect('/');


});
app.get('/login',function(req,res){
  console.log(arguments.length);
  res.render('login');
});
app.get("/AdminApp.js",function(req,res){
  res.sendFile(__dirname+'/views/AdminApp.js');
});
app.get('/admin.css',function(req,res){
  res.sendFile(__dirname+'/views/admin.css');

});
var io = require('socket.io').listen(app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
}));
io.sockets.on('connection',function(socket){
  console.log("SOCKET!!!");
  socket.on('NewServer',function(data){
    console.log(data);
    InsertData('servers',data,function(){
      console.log("Done Update");
    });

  });
});
function DataBase(username,password,collectionName,result) {
  var val=0;
  var url = 'mongodb://localhost:27017/mydb';
  var callback=function(db,val){db.close();result(null,val);}
// Use connect method to connect to the server
  MongoClient.connect(url, function (err, db) {
    console.log("Connected succesfully to server");

    var collection = db.collection(collectionName);

    collection.find({}).toArray(function (err, users) {
      console.log("Found the following records");

      users.forEach(function(elm,index,users){
        if ((elm.username==username && elm.password==password)) {
          console.log('yes');
          val=1;

        }
      });
      callback(db,val);

    });
    //db.close();
  });
}

function GetServerList(done){
  var url = 'mongodb://localhost:27017/mydb';
  var callback=function(db,servers){db.close();done(servers);}
  MongoClient.connect(url, function (err, db) {
    console.log("Connected succesfully to server");

    var collection = db.collection('servers');

    collection.find({}).toArray(function (err, servers) {
       callback(db,servers);
    });
    });
};
function InsertData(CollectionName,data,callback){
  var url = 'mongodb://localhost:27017/mydb';
  MongoClient.connect(url, function (err, db) {
    console.log("error: " +err);
    var collection = db.collection(CollectionName.toString());
    collection.insertOne(data,function(){
      console.log("\n\n\nArgument :"+arguments.length);
        db.close();
        callback();
    });
  });
}