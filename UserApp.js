/**
 * Created by thomas on 10/06/16.
 */
var app=angular.module('UserApp',[]);
app.controller('UserCtr',function ($scope,$http,$window) {
    //var socket = io.connect('http://localhost:3000');
    var socket=io();
    var msgs=["HP Superdome Server","Virtual Machine by VMware"]
    $scope.lastindex=-1;
    $scope.serverclass="server";
    $scope.ipaddress="hello";
    $scope.owner="world";
    $scope.msg="what";
    $scope.serverinfo="Hello";
    $scope.user="";
    $scope.HideUserErrMsg=true;
    $scope.HidePassErrMsg=true;
    $scope.ip=""
    $scope.serverTable=[];
    $http.get('/serverdata').success(function(data){

        $scope.ServerList=data;
        $scope.IsHidden=[];
        for (var i=0;i<$scope.ServerList.length;i++) $scope.IsHidden.push(true);
        for (var j=0,k=-1;j<$scope.ServerList.length;j++) {
            console.log(k);
            if (!(j%3)){
                k++;
                console.log(k);
                ($scope.serverTable).push([]);
                console.log($scope.serverTable);
            }
            ($scope.serverTable[k]).push($scope.ServerList[j]);
        }
    });
    $http.get('/getuser').success(function(data){
        $scope.username=data;
        io().on(data,function(ans) {
            alert(ans.msg);
            console.log(ans);

            for (var i = 0; i < $scope.ServerList.length; i++) {
            console.log("look at "+i)
            if ($scope.ServerList[i].ip == ans.ip) {
                console.log("Found " + i)
                $scope.serverTable[~~(i / 3)][i % 3].Owner = ans.taker;
                break;
            }
        }
            });
    });


    $scope.divhandle=function(elm,index){
        //console.log(index);
        //$scope.IsHidden[index]=!$scope.IsHidden[index];
       // console.log("clicked "+elm);
        if ($scope.lastindex!=-1)
            document.getElementById("server"+$scope.lastindex).className='server';
        $scope.lastindex=index;
        document.getElementById("wrapper").hidden=false;
        document.getElementById("server"+index).className='serverChosen';
        $scope.ipaddress=$scope.ServerList[index].ip;
        $scope.owner=$scope.ServerList[index].Owner
        $scope.msg=msgs[(+$scope.ServerList[index].IsVirtual)];
        $scope.serverinfo=$scope.ServerList[index].Description;
        $scope.serverUsers="";

    }
    $scope.takeOwen = function(){
       // var socket = io.connect('http://localhost:3000');
        if ($scope.ServerList[$scope.lastindex].Owner!=$scope.username)
         socket.emit('updateOwner',{ip : $scope.ServerList[$scope.lastindex].ip, owner : $scope.username,OldOwner:$scope.ServerList[$scope.lastindex].Owner},function(){

             //console.log("index is:"+($scope.lastindex/3));
             console.log("array is"+JSON.stringify($scope.serverTable));;
             (($scope.serverTable)[~~($scope.lastindex/3)])[($scope.lastindex-0)%3].Owner=$scope.username;
         });
        else
            alert("You Owner this server already!")
    };
    $scope.ListUsers=function(){
        socket.emit('ListUsers',$scope.ipaddress,function(data){
            $scope.serverUsers=data;
            
        });
        /*
        socket.on('UsersList',function(data){
            data.forEach(function(elm){
                $scope.serverUsers+=elm;
            });*/
        

    }

   
});