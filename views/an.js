var x=0;
var text='<option value="A">A</option> <option value="B">B</option><option value="C" >C</option><option value="X">X</option> <option value="V">V</option><option value="M">M</option>'
var selectItem=document.createElement("select");
selectItem.innerHTML=text;
var div=document.createElement('div');
var tr=document.createElement('tr');
var td=document.createElement('td');
var index=["A","B","C","X","V","M"];
var tailIndex=[" ","X","B","A"];
var month=CreateMonth();
var sidur=["X","M","X","A","A","A","A","C","C","B","X","M","X","A","A","A","A","C","C","B","X","M","X","A","A","A","A","C","C","B",""];
var last=0;
var k=0;
var tail=document.getElementsByClassName("tailSelect");
var selecthandle=function(elm){
    elm.className=elm.options[elm.selectedIndex].value

}
function bt(){
    var p=document.createElement("p");
    var table=document.getElementById('calendar');
    for (var i=0;i<month.length;i++){
        var TR=tr.cloneNode(true);
        for (var j=0;j<7;j++){
            var TD=td.cloneNode(true);
            if (month[i][j]==1) last=1;
            var d=div.cloneNode(true);
            var NewP=p.cloneNode(true);
            var cln=selectItem.cloneNode(true);
            if (month[i][j])
                 d.innerHTML=month[i][j].toString();
            if (!last || !month[i][j]) TD.className='lastmonth';
           else {
               cln.className=(sidur[k]).toString();
               cln.selectedIndex=index.indexOf(sidur[k]);
               cln.onchange=function(){selecthandle(this);};
               k++;
               if (j == 6) TD.className = 'sday';
               else TD.className = 'day';
           }
            TD.appendChild(d);
            TD.appendChild(NewP);
            if (last && month[i][j]) TD.appendChild(cln);
            TR.appendChild(TD);
        }

        table.appendChild(TR);
    }


}
var auto=0
var autofill= function(mode){
    if (mode)
        document.getElementById("buttom").hidden=false;
    else
        document.getElementById("buttom").hidden=true;

}
var fill=function (mode) {
    var cln=document.getElementsByTagName('select');
    for (var i=1;i<cln.length;i++){
        sidur[i-1]=mode;
        cln[i].className=mode;
        cln[i].selectedIndex=index.indexOf(mode);
    }
    console.log(sidur);
}

function CreateMonth(){
    var days=1;
    var j=1;
    var month=[[]];
    var d=new Date();
    d.addMonths(-1);
    d.moveToLastDayOfMonth();
    var lastday = d.getDay()+1;
    var lastdate=d.getDate();
    d.addMonths(1);
    d.moveToLastDayOfMonth();
    var DaysInMonth=d.getDate();
    for (var i=lastday;i%7 && i;i--,lastdate--){
        month[0].unshift(lastdate);
    }
    for (i=lastday;i<7;i++,days++) month[0].push(days);
    while (days<=DaysInMonth){
        month.push([]);
        for (var k=0;k<7;k++,days++){
            if (days>DaysInMonth) month[j].push(0);
            else
                month[j].push(days);
        }
        j++;
    }
    return month;

}

function  send(){
    if (!(tail[0].selectedIndex)){
        alert("Please Choose tail option");
        return;
    }
    sidur[sidur.length-1]=tailIndex[tail[0].selectedIndex];
    
}