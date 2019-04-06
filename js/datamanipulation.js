$.fn.dataTable.ext.errMode = 'none'; $('#table-id').on('error.dt', function(e, settings, techNote, message) { console.log( 'An error occurred: ', message); });
createTables();
var dateElements = getDateElements();
fixDates();
var tables = getTables();
var savedFilters = [];
this.onload = function (){
	document.getElementById("todaysAcca").innerHTML = printAcca();
	fixTables();
	fixFiltering();
}

colorSpectrumClasses = ["worst", "bad", "medBad", "lightBad", "med", "lightGood", "medGood", "good", "best"];
colorSpectrumRanges = [25,35,45,55,65,75,85,95,105];
colorSpectrumRangesFT = [15,25,30,35,40,45,55,65,105];
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
		for(var m in data[i].matches){
			var rowNode = t.row.add([
	            parseTime(data[i].matches[m].time),
	            data[i].matches[m].home.name,
	            data[i].matches[m].score,
	            data[i].matches[m].away.name,
	            parseFloat(data[i].matches[m].FT[0]*100).toFixed(2),
	            parseFloat(data[i].matches[m].FT[1]*100).toFixed(2),
	            parseFloat(data[i].matches[m].FT[2]*100).toFixed(2),
	            parseFloat(data[i].matches[m].GG*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[1]*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[2]*100).toFixed(2),
	            parseFloat(data[i].matches[m].O[3]*100).toFixed(2),
	            data[i].matches[m].home.history.length + data[i].matches[m].away.history.length
	        ] ).draw( false ).node();
	        fixColorSchemeByRow(rowNode);
		}
	//fixColorScheme(t);
}
function fixColorSchemeByRow(row){
	var colData = $(row).find("td");
	for(var i = 4; i < 7; i++){
		paintFTCell(colData[i]);
	}
	for(var i =7; i < colData.length-1; i++){
		paintCell(colData[i]);
	}
}
function paintFTCell(cell){	
	if(!isNaN(cell.innerText)){
		for(var i in colorSpectrumRangesFT){
			if(parseFloat(cell.innerText) < colorSpectrumRangesFT[i] ){
				cell.className += colorSpectrumClasses[i];
				break;
			}
		}
	}
}
function paintCell(cell){
	if(!isNaN(cell.innerText)){
		for(var i in colorSpectrumRanges){
			if(parseFloat(cell.innerText) < colorSpectrumRanges[i] ){
				cell.className += colorSpectrumClasses[i];
				break;
			}
		}
	}
}
function fixFiltering(){
	for(var i =0 ; i < data.length; i ++){
		var filters = document.getElementsByClassName("dataTables_filter");
		filters[i].innerHTML = '<label><input type="checkbox" checked name="filter-'+i+'" onclick="filterTable('+i+')">Data_Used atleast 20&nbsp;&nbsp;&nbsp;&nbsp;</label>'+filters[i].innerHTML;
		filterTable(i);
	}
}
function filterTable(i){
	var table = $("#predictionTable-"+i).DataTable();
	var limit = 20;
	if(!document.getElementsByName("filter-"+i)[0].checked){
		$.fn.dataTable.ext.search.splice($.fn.dataTable.ext.search.indexOf(savedFilters[i]),1);
		table.draw();
		return;
	}
	//custom filtering function
	savedFilters[i] =function( settings, data, dataIndex ) {
	    	if(settings.nTable.id != "predictionTable-"+i)return true;
	        return parseInt(data[data.length-1]) >= limit;
	    }; 
	$.fn.dataTable.ext.search.push(savedFilters[i]);
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
        if(isWithinRange(todaysMatches[i].FT[0],0.45,0.85) && hasEnoughData(todaysMatches[i],minHistory)) {
            checkPriority(acca,3,todaysMatches[i],"Home Wins", limit);   
        }else if(isWithinRange(todaysMatches[i].FT[1],0.45,0.85) && hasEnoughData(todaysMatches[i],minHistory)) {
            checkPriority(acca,3,todaysMatches[i],"Draw", limit);   
        }else if(isWithinRange(todaysMatches[i].FT[2],0.45,0.85) && hasEnoughData(todaysMatches[i],minHistory)) {
            checkPriority(acca,3,todaysMatches[i],"Away Wins", limit);    	
        }else if(isWithinRange(todaysMatches[i].O[2],0.76,0.83) && hasEnoughData(todaysMatches[i],minHistory)) {
            checkPriority(acca,2,todaysMatches[i],"Over 2.5", limit);
        }else if(isWithinRange(todaysMatches[i].GG,0.72,0.87)&& hasEnoughData(todaysMatches[i],minHistory)){
			checkPriority(acca,1,todaysMatches[i],"GG", limit);
        }else if(isWithinRange(todaysMatches[i].O[1],0.7,1) && hasEnoughData(todaysMatches[i],minHistory)){
			checkPriority(acca,1,todaysMatches[i],"Over 1.5", limit);
        }
    }
	return acca;
}
function getModestAcca(){
	/*var bestModesFT = 0;
	var bestModestO25 = 0;
	var bestModestGG = 0;
	var bestModestO15 =0;
	var acca = [];
    var limit = 6;
    var minHistory = 8;
    var todaysMatches = data[1];// data.find(function(a){return new Date(a.targetDate).getDate() == new Date().getDate();}).matches;

    for(var i = 0 ; i < todaysMatches.length; i++){
    	if(isWithinRange(todaysMatches[i].FT[0]),)
        if(isWithinRange(todaysMatches[i].O[2],0.65,0.75) && hasEnoughData(todaysMatches[i],minHistory)) {
            checkPriority(acca,2,todaysMatches[i],"Over 2.5", limit);
        }else if(isWithinRange(todaysMatches[i].GG,0.75,0.85)&& hasEnoughData(todaysMatches[i],minHistory)){
			checkPriority(acca,1,todaysMatches[i],"GG", limit);
        }else if(isWithinRange(todaysMatches[i].O[1],0.7,1) && hasEnoughData(todaysMatches[i],minHistory)){
			checkPriority(acca,0,todaysMatches[i],"Over 1.5", limit);
        }
    }
	return acca;*/
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
				if(priority > 2 && toReplace == -1){
					toReplace = acca.findIndex(function(a){return typeof(a)=="string" && a.includes("2.5")});
				}
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

