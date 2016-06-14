/**
 * Created by thomas on 09/06/16.
 */
var app=angular.module('RegisterApp',[]);
app.controller('FormCtr',function ($scope,$http,$window) {
  $scope.user="";
  $scope.HideUserErrMsg=true;
  $scope.HidePassErrMsg=true;
  $scope.ip=""
  $http.get('/userlist').success(function(data) {
          $scope.users=[];
          for (var i=0;i<data.length;i++)
            $scope.users.push(data[i].username);
          $scope.ip=data[i-1].ip;

  });
  $scope.ErrorMsg="";
  $scope.checkuser = function(){
    console.log(!($scope.user) );
    if (!($scope.user)  || (($scope.user).length) <5){
      $scope.ErrorMsg="Username Must be 5 char long";
      $scope.HideUserErrMsg=false;
      return;
    }
    if ($scope.users.indexOf(($scope.user).toString())>-1){
       $scope.ErrorMsg="Username already exist";
      $scope.HideUserErrMsg=false;
      return;
    }
    $scope.HideUserErrMsg=true;
    $scope.ErrorMsg=""
  }
  $scope.checkpass=function(){
    if ($scope.password && (($scope.password).length)<6){
      $scope.HidePassErrMsg=false;
      $scope.ErrorMsgPass="Password is too short"
      return;
    }
    $scope.HidePassErrMsg=true;
    $scope.ErrorMsgPass=""
  }
  $scope.sendform = function(){
    console.log($scope.registerForm.email.$valid);
     if ($scope.HidePassErrMsg && $scope.HideUserErrMsg && $scope.registerForm.email.$valid){
       var newip=($scope.ip).split('.');
       newip[3]-=0;newip[3]+=1;
       newip=newip.join('.');
       var socket = io.connect('http://localhost:3000');
       socket.emit('adduser',{username:$scope.user,password:$scope.password,email:$scope.email,ip:newip},function(){
         alert('You have been register successfully,\nPlease Notice, your Static ip address is: '+newip+ '\nPress ok to redierct to the login Page');
         $window.location.href='/login';
       });
     }
    else{alert("There are some errors at your registration form.")}
  }
});
