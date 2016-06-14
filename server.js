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
var exec = require('ssh-exec');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var users=[];
var sshData={
  user:'usernameByCyberX',
  host:"",
  key:"CyberXKey",
  password:"CyberXPassword"
};
app.use(Body());
app.use(cookie());
app.use(expressSession({secret: "Jello"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + 'style'));

passport.use(new passportLocal.Strategy(function(username,password,done){
  if (username=="admin" && password=="admin"){

    GetServerList(function(servers){
      console.log("res is "+JSON.stringify(servers));
      done(null,{user:"admin","ServerList":servers});

    });
  }
  else {
    DataBaseLookUp(username, password,'user', function (err, res) {
      if (res)
        done(null, {user: username});
      else
        done(null, false);
    });
  }
}));
app.set('view engine','ejs');
app.get('/serverdata',function(req,res){
  GetServerList(function(servers){
     res.json(servers);
  });
});
app.get('/userlist',function(req,res){
  GetUsersList(function(users){
    res.json(users);
  });
});
app.get('/', function (req, res) {

  if (req.isAuthenticated()) {
    //console.log(req.user);
    if (req.user=="admin"){
      //res.json({"ServerList":req.user.ServerList})
      res.sendFile(__dirname+'/views/admin.html');
      
    }
    else {
      users.push(req.user);
      console.log(JSON.stringify( users));;
      res.render('Home', {isAuth: true, user: req.user});
    }
  }
  else
      res.redirect('/login');
});
passport.serializeUser(function(user,done){
    done(null,user.user);

});

passport.deserializeUser(function(user,done){
  console.log("De Serial "+user);
  done(null,user);

});

app.post('/login',passport.authenticate('local',{ failureRedirect: '/Flogin' }),function(req,res){
  console.log("req is:  \n\n"+req.user);
  res.redirect('/');
});
app.get('/logout',function(req,res){
  var index=users.indexOf(req.user);
  if(index>-1)
    users.splice(index,1);
  req.logout();
  res.redirect('/');
});
app.get("/register",function(req,res){
  res.sendFile(__dirname+'/views/register.html');
});
app.get("/getuser",function(req,res){
  res.json(req.user);
});
app.get('/login',function(req,res){
  console.log();
  res.render('login',{errmsg:0});
});
app.get('/Flogin',function(req,res){
  console.log();
  res.render('Flogin',{errmsg:0});
});
app.get('/check',function(req,res){
  console.log("Check Get Function "+req.user);
  res.render('Home',{user:req.user});
});
app.get("/AdminApp.js",function(req,res){
  res.sendFile(__dirname+'/views/AdminApp.js');
});
app.get("/UserApp.js",function(req,res){
  res.sendFile(__dirname+'/views/UserApp.js');
});
app.get("/RegisterApp.js",function(req,res){
  res.sendFile(__dirname+'/views/RegisterApp.js');
});
app.get('/admin.css',function(req,res){
  res.sendFile(__dirname+'/style/admin.css');
});
app.get('/UserStyle.css',function(req,res){
  res.sendFile(__dirname+'/style/UserStyle.css');
});
app.get('/LoginStyle.css',function(req,res){
  res.sendFile(__dirname+'/style/LoginStyle.css');
});
var io = require('socket.io').listen(app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
}));
io.sockets.on('connection',function(socket){
  console.log("SOCKET!!!");
  socket.on('NewServer',function(data,callback){
    console.log(data);
    InsertData('servers',data,function(){
      console.log("Done Update");
      callback();
    });

  });
  socket.on("RemoveServer",function(data){
    console.log(data);
    RemoveObject('servers',data.obj,function(deleteCount){
      socket.emit("ServerRemoveReplay",deleteCount,function(){
        console.log("Done");
      });
    });
  });
  socket.on("adduser",function(data,callback){
    console.log(data);
    InsertData('user',data,function(){
        console.log("Done");
        callback();
    });
  });
  socket.on('updateOwner',function(data,next){
    console.log("next is "+typeof (next))
    var callback=function(server) {

      if (users.indexOf(server.owner) > -1) {
          io.emit(server.OldOwner.toString(), {msg:'Your ownership for:'+server.ip+' has been taken by '+server.owner,taker:server.owner,ip:server.ip});
      console.log("Owner shipp alerting!!"+server.OldOwner.toString());
    }
      else
          //mail..
          console.log('mail');

    }
    UpdateData('servers',data,callback,next);
  });
  socket.on('ListUsers',function(ip,next){
      sshData.host=ip;
    exec("echo $SSH_CLIENT | awk '{ print $1}'", sshData,function(err,stdout,stderr){
      if (err)
          next("Error occur , couldn't get Users Data");
      else 
          next(stdout.split('\n'));
    });
  });
});
function DataBaseLookUp(username,password,collectionName,result) {
  var val=0;
  var url = 'mongodb://localhost:27017/mydb';
  var callback=function(db,val){db.close();result(null,val);}
  MongoClient.connect(url, function (err, db) {
    var collection = db.collection(collectionName);
    collection.find({}).toArray(function (err, users) {
      users.forEach(function(elm,index,users){
        if ((elm.username==username && bcrypt.compareSync(password, elm.password))) {
          val=1;}
      });
      callback(db,val);
    });
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
function GetUsersList(done){
  var url = 'mongodb://localhost:27017/mydb';
  var callback=function(db,users){db.close();done(users);}
  MongoClient.connect(url, function (err, db) {
    var collection = db.collection('user');
      collection.find({},{'username':1,"_id":0,'ip':1}).toArray(function (err, users) {
      callback(db,users);
    });
  });
};
function InsertData(CollectionName,data,callback){
  var url = 'mongodb://localhost:27017/mydb';
  MongoClient.connect(url, function (err, db) {
    console.log("error: " +err);
    var collection = db.collection(CollectionName.toString());
    if (CollectionName=='user') data.password=bcrypt.hashSync(data.password, bcrypt.genSaltSync(saltRounds));
    collection.insertOne(data,function(){
        db.close();
        callback();
    });
  });
}
function RemoveObject(CollectionName,data,callback){
  var url = 'mongodb://localhost:27017/mydb';
  MongoClient.connect(url, function (err, db) {
    var collection = db.collection(CollectionName.toString());
    collection.deleteOne({"ip":data.ip},function(err,results){
      console.log(results.deletedCount);
      console.log("\n\n\nServerRemove Err"+data._id);
      db.close();
      callback(results.deletedCount);
    });
  });
}
function UpdateData(CollectionName,data,callback,next){
  var url = 'mongodb://localhost:27017/mydb';
  MongoClient.connect(url, function (err, db) {
    console.log("data: " +JSON.stringify(data));
    var collection = db.collection(CollectionName.toString());
    collection.updateOne({'ip':data.ip},{$set : {'Owner':data.owner}},function(ans){
      console.log("updating "+data.ip);
      console.log(JSON.stringify(ans));
      db.close();
      callback(data);
      next();

    });
  });
}