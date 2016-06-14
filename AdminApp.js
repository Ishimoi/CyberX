/**
 * Created by thomas on 07/06/16.
 */
var app=angular.module('app',[]);
app.controller('ctrl1',function ($scope,$http,$window) {
    var socket = io.connect('http://localhost:3000');
    var msgs=["HP Superdome Server","Virtual Machine by VMware"];
    var removed=[];
    $scope.lastindex=-1;
    $scope.serverclass="server";
    $scope.ipaddress="hello";
    $scope.owner="world";
    $scope.msg="what";
    $scope.serverinfo="Hello";
    $http.get('/serverdata').success(function(data){
       $scope.serverTable=[];
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
    $scope.first="";
    $scope.ip=[0,0,0,0];
    $scope.owner="";
    $scope.dis="";
    $scope.select=null;
    $scope.socketConnection=function() {
        //var socket = io.connect('http://localhost:3000');
        console.log(socket);
        console.log($scope.ip,$scope.owner,$scope.dis,$scope.select);
        var address=$scope.ip[0]+'.'+$scope.ip[1]+'.'+$scope.ip[2]+'.'+$scope.ip[3];
        socket.emit('NewServer', {ip:address,IsVirtual:$scope.select=="Yes",Owner:$scope.owner,Description:$scope.dis},function(){
            $window.location.reload();
            
        });
    }
    $scope.RemoveServer=function(index){
        index=$scope.lastindex;
        removed.push(index);
        console.log("Index is : "+index);
        //var socket = io.connect('http://localhost:3000');
        socket.emit('RemoveServer', {obj:$scope.ServerList[index]});
        socket.on("ServerRemoveReplay",function(ans,callback){
            if (ans) {
                console.log("replay -->" + ans.toString()+" Index "+index.toString());
                var elm=document.getElementById('server'+index.toString());
                console.log(elm);
                elm.className="removed";

            }
            callback();
        });
        $scope.lastindex=-1;
    };
    $scope.divhandle=function(elm,index){
        if (removed.indexOf(index)>-1) return;
        if ($scope.lastindex==-1) document.getElementById("infodiv").hidden=false;
        if ($scope.lastindex!=-1) {
            document.getElementById("server" + $scope.lastindex).className = 'server';

        }
        $scope.lastindex=index;
        document.getElementById("server"+index).className='serverChosen';
        $scope.ipaddress=$scope.ServerList[index].ip;
        $scope.owner=$scope.ServerList[index].Owner
        $scope.msg=msgs[(+$scope.ServerList[index].IsVirtual)];
        $scope.serverinfo=$scope.ServerList[index].Description;
        $scope.serverUsers="";


    }
  
});
