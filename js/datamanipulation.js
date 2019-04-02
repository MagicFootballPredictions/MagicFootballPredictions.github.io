$.fn.dataTable.ext.errMode = 'none'; $('#table-id').on('error.dt', function(e, settings, techNote, message) { console.log( 'An error occurred: ', message); });
createTables();
var dateElements = getDateElements();
fixDates();
var tables = getTables();
this.onload = function (){
	document.getElementById("todaysAcca").innerHTML = printAcca();
	fixTables();
}


function createTables(){
	for(d in data){
		var temp = document.getElementsByTagName("template")[0];
  		var clon = temp.content.cloneNode(true);
  		document.getElementById("tables").appendChild(clon);
	}
}
function getDateElements(){
	return document.getElementsByClassName("table-date");
}
function fixDates(){
	console.log(dateElements);
	for(var d = 0; d<dateElements.length; d++){
		console.log(setDate(data[d].targetDate));
		dateElements[d].innerHTML = setDate(data[d].targetDate);
		dateElements[d].setAttribute("data-target","#collapsable-"+d);
		document.getElementsByClassName("collapsable")[d].setAttribute("id","collapsable-"+d);
		if(d == Math.ceil(dateElements.length/2)-1){
			document.getElementsByClassName("collapsable")[d].classList.add("show");
		}
	}
}
function setDate(date){
	return new Date(date).toDateString();
}
function getTables(){
	return document.getElementsByClassName("predictionTable");
}
function fixTables(){
	for(var i = 0 ; i < data.length; i++){
		tables[i].setAttribute("id","predictionTable-"+i);
		$("#predictionTable-"+i).DataTable();
		var t =$("#predictionTable-"+i).DataTable();
		for(var m in data[i].matches)
			t.row.add([
	            parseTime(data[i].matches[m].time),
	            data[i].matches[m].home.name,
	            data[i].matches[m].score,
	            data[i].matches[m].away.name,
	            parseFloat(data[i].matches[m].GG*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[0]*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[1]*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[2]*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[3]*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[4]*100).toFixed(2),
	            data[i].matches[m].home.history.length + data[i].matches[m].away.history.length
	        ] ).draw( false );
	}
}
function parseTime(time){
	return (time.split(":")[0].length < 2 ? "0": "" ) + time;
}

function printAcca(){
	var acca = getAcca();
	var a = ""
	for(var i = 0 ; i < acca.length; i++){
		if(i%2==0){
			a+=acca[i].home.name+" vs "+acca[i].away.name+" => ";
        }else{
			a+=acca[i]+(i!=acca.length-1?" --- ":"");
        }
    }
	console.log(a);
	return a;	
}
function getAcca(){
    var todaysMatches = data.find(function(a){return new Date(a.targetDate).getDate() == new Date().getDate();}).matches;
    var acca = [];
    for(var i = 0 ; i < todaysMatches.length; i++){
        if(todaysMatches[i].O[2] > 0.75 && todaysMatches[i].O[2] < 0.9 && todaysMatches[i].home.history.length > 7 && todaysMatches[i].away.history.length > 7) {
            acca.push(todaysMatches[i]);
			acca.push("Over 2.5");
            if(acca.length == 6) return acca;
        }
    }
	for(var i = 0; i < todaysMatches.length; i++){
		if(todaysMatches[i].GG + todaysMatches[i].O[1] >= 1.6 && todaysMatches[i].home.history.length > 7 && todaysMatches[i].away.history.length > 7){
			acca.push(todaysMatches[i]);
			if(todaysMatches[i].O[1] > todaysMatches[i].GG){
				acca.push("GG");
            }else{
				acca.push("Over 1.5");
            }
			if(acca.length == 6) return acca;
        }
    }
	return acca;
}