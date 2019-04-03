$.fn.dataTable.ext.errMode = 'none'; $('#table-id').on('error.dt', function(e, settings, techNote, message) { console.log( 'An error occurred: ', message); });
createTables();
var dateElements = getDateElements();
fixDates();
var tables = getTables();
this.onload = function (){
	document.getElementById("todaysAcca").innerHTML = printAcca();
	fixTables();
	fixFiltering();
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
		fixTable(i);
	}
}
function fixTable(i){
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
function fixFiltering(){
	for(var i =0 ; i < data.length; i ++){
		var filters = document.getElementsByClassName("dataTables_filter");
		filters[i].innerHTML = '<label><input type="checkbox" name="filter-'+i+'" onclick="filterTable('+i+')">Data_Used atleast 20&nbsp;&nbsp;&nbsp;&nbsp;</label>'+filters[i].innerHTML;
	}
}
function filterTable(i){
	console.log("ASD");
	var limit = 20;
	if(!document.getElementsByName("filter-"+i)[0].checked){
		//fix it pls
		return;
	}
	var table = $("#predictionTable-"+i).DataTable();
	//custom filtering function
	$.fn.dataTable.ext.search.push(
	    function( settings, data, dataIndex ) {
	    	if(settings.nTable.id != "predictionTable-"+i)return true;
	        return parseInt(data[10]) >= limit;
	    }
	);
	table.draw();
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
			a+=acca[i]+(i!=acca.length-1?"<br>":"");
        }
    }
	console.log(a);
	return a;	
}
function getAcca(){
    var todaysMatches = data.find(function(a){return new Date(a.targetDate).getDate() == new Date().getDate();}).matches;
    var acca = [];
    var limit = 6;
    var minHistory = 8;
    for(var i = 0 ; i < todaysMatches.length; i++){
        if(isWithinRange(todaysMatches[i].O[2],0.76,0.83) && hasEnoughData(todaysMatches[i],minHistory)) {
            checkPriority(acca,2,todaysMatches[i],"Over 2.5", limit);
        }else if(isWithinRange(todaysMatches[i].GG,0.72,0.87)&& hasEnoughData(todaysMatches[i],minHistory)){
			checkPriority(acca,1,todaysMatches[i],"GG", limit);
        }else if(isWithinRange(todaysMatches[i].O[1],0.7,1) && hasEnoughData(todaysMatches[i],minHistory)){
			checkPriority(acca,1,todaysMatches[i],"Over 1.5", limit);
        }
    }
	return acca;
}
function checkPriority(acca, priority, match, text, limit){
	if(acca.length < limit){
		acca.push(match);
		acca.push(text);
	}else{
		var toReplace = -1;
		if(priority > 0){
			toReplace = acca.findIndex(function(a){return typeof(a)=="string" && a.includes("1.5")});
			if(priority > 1 && toReplace == -1){
				toReplace = acca.findIndex(function(a){return typeof(a)=="string" && a.includes("GG")});
			}
		}
		if(toReplace != -1){
			acca[toReplace-1] = match;
			acca[toReplace] = text;
		}
	}
}
function isWithinRange(value, lowerRange, upperRange){
	return value <= upperRange && value >= lowerRange;
}
function hasEnoughData(match,limit){
	return match.home.history.length > limit && match.away.history.length > limit;
}

