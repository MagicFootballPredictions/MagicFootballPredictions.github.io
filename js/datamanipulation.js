$.fn.dataTable.ext.errMode = 'none'; $('#table-id').on('error.dt', function(e, settings, techNote, message) { console.log( 'An error occurred: ', message); });
createTables();
var dateElements = getDateElements();
fixDates();
var tables = getTables();
var savedFilters = [];
this.onload = function (){
	fixData();
	document.getElementById("todaysAcca").innerHTML = printAcca();
	document.getElementById("showPrev").innerHTML = printPreviousAcca();
	document.getElementById("underdogModalBody").innerHTML = printUnderdogAcca();
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
function fixData(){
	for(var i =0 ; i < data.length; i++)
		data[i].matches.sort(function(a,b){ return priority(b) - priority(a);});
}
function priority(m){
	return m.FT[0]*10000*10000 + m.FT[2]*1000*10000 + m.O[2]*100*10000 + m.GG*10*10000 + m.O[1]*10000;
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
			var colData = $(rowNode).find("td");
	        fixColorSchemeByRow(colData);
	        colData[0].className+=" shrink";
	        colData[colData.length - 1].className+=" data_used_clickable";
	        colData[colData.length - 1].setAttribute("data-toggle","modal");
	        colData[colData.length - 1].setAttribute("data-target","#modalCenter");
	        colData[colData.length - 1].setAttribute("onclick","setModal("+i+","+m+")");
		}
	//fixColorScheme(t);
}
function fixColorSchemeByRow(colData){
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
function setModal(dataIndex,matchIndex){
	var match = data[dataIndex].matches[matchIndex];
	var table = $("#modal-table").DataTable({
   		bSort: false,
   		bFilter: false
	});
	var rows = table
    .rows()
    .remove()
    .draw();
	document.getElementById("modalLongTitle").innerText = match.time+ " " + match.home.name +" "+ match.score +" "+ match.away.name;
	for(var i =0 ; i < Math.max(match.home.history.length,match.away.history.length); i++){
		table.row.add([
			match.home.history[i]? match.home.history[i].dataArray[0]:"",
			match.home.history[i]? match.home.history[i].dataArray[1]:"",
			match.home.history[i]? match.home.history[i].dataArray[2]:"",
			match.home.history[i]? match.home.history[i].dataArray[3]:"",
			"-",
			match.away.history[i]? match.away.history[i].dataArray[0]:"",
			match.away.history[i]? match.away.history[i].dataArray[1]:"",
			match.away.history[i]? match.away.history[i].dataArray[2]:"",
			match.away.history[i]? match.away.history[i].dataArray[3]:"",
			]).draw(false);
	}
}
function fixFiltering(){
	for(var i =0 ; i < data.length; i ++){
		var filters = document.getElementsByClassName("dataTables_filter");
		createCheckBoxEl(filters[i],i);
		//filters[i].innerHTML = '<label><input type="checkbox" checked name="filter-'+i+'" onclick="filterTable('+i+')">Data_Used atleast 20&nbsp;&nbsp;&nbsp;&nbsp;</label>'+filters[i].innerHTML;
		filterTable(i);
	}
}
function createCheckBoxEl(filters,i){
	var label = document.createElement("label");
	label.innerHTML = '<input type="checkbox" checked name="filter-'+i+'" onclick="filterTable('+i+')">Data_Used atleast 20&nbsp;&nbsp;&nbsp;&nbsp;';
	filters.insertBefore(label,filters.firstChild);
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
	//table.draw();
}
function parseTime(time){

	return (time.split(":")[0].length < 2 ? "0": "" ) + time;
}
function printAcca(){
	var acca = getAcca(data.find(function(a){return new Date(a.targetDate).getDate() == new Date().getDate();}).matches,false);
	return accaStringify(acca);	
}
function printPreviousAcca(){
	var d = 0;
	var a = "";
	do{
		if(d > 0)a+="<br>";
		var tDate = new Date(data[d].targetDate);
		a+=tDate.getDate()+"/"+(tDate.getMonth()+1)+"<br>";
		var acca = getAcca(data[d].matches,false);
		a+= accaStringify(acca);
	    d++;
	}while(new Date(data[d].targetDate).getDate() != new Date().getDate());
	return a;
}
function printUnderdogAcca(){
	var d = 4;
	var a = "";
	do{
		if(d > 0)a+="<br>";
		var tDate = new Date(data[d].targetDate);
		a+=tDate.getDate()+"/"+(tDate.getMonth()+1)+"<br>";
		var acca = getAcca(data[d].matches,true);
		a+= accaStringify(acca);
	    d--;
	}while(d>=0);
	return a;
}
function accaStringify(acca){
	var a = "";
	for(var i = 0 ; i < acca.length; i++){
			a+=acca[i].match.home.name+" vs "+acca[i].match.away.name+" => ";
			a+=acca[i].text+" ("+acca[i].match.score+")"+(i!=acca.length-1?"<br>":"");
    }
    return a;
}
function getAcca(todaysMatches, careAboutUnderdog){
    var acca = [];
    var limit = 3;
    var minHistory = 8;
    for(var i = 0 ; i < todaysMatches.length; i++){
        if(isWithinRange(todaysMatches[i].FT[0],0.45,0.85) && hasEnoughData(todaysMatches[i],minHistory) && (!careAboutUnderdog || isUnderdog(todaysMatches[i].home.odds))) {
            checkPriority(acca,3,todaysMatches[i],"Home Wins", limit, 0.55);
        }else if(isWithinRange(todaysMatches[i].FT[2],0.45,0.85) && hasEnoughData(todaysMatches[i],minHistory) && (!careAboutUnderdog || isUnderdog(todaysMatches[i].away.odds))) {
            checkPriority(acca,3,todaysMatches[i],"Away Wins", limit, 0.55);    	
        }else if(isWithinRange(todaysMatches[i].O[2],0.76,0.83) && hasEnoughData(todaysMatches[i],minHistory) && !careAboutUnderdog) {
            checkPriority(acca,2,todaysMatches[i],"Over 2.5", limit, 0.65);
        }else if(isWithinRange(todaysMatches[i].GG,0.72,0.87)&& hasEnoughData(todaysMatches[i],minHistory) && !careAboutUnderdog){
			checkPriority(acca,1,todaysMatches[i],"GG", limit, 0.75);
        }else if(isWithinRange(todaysMatches[i].O[1],0.7,1) && hasEnoughData(todaysMatches[i],minHistory) && !careAboutUnderdog){
			checkPriority(acca,1,todaysMatches[i],"Over 1.5", limit, 1);
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
function isUnderdog(value){
	return value > 3;
}
function checkPriority(acca, priority, match, text, limit, peak){
	if(acca.length < limit){
		acca.push(new Bet(match,text,priority,peak));
	}else{
		var toReplace = -1;
		if(priority > 0){
			toReplace = searchLowestPeakByPriority(acca, 0);
			if(priority > 1 && toReplace == -1){
				toReplace = searchLowestPeakByPriority(acca, 1);
				if(priority > 2 && toReplace == -1){
					toReplace = searchLowestPeakByPriority(acca, 2);
					if(toReplace == -1){
						toReplace = searchLowestPeakByPriority(acca, 3);
					}
				}
			}
		}
		if(toReplace != -1){
			if(priority > acca[toReplace].priority)
				acca[toReplace] = new Bet(match, text, priority, peak);
			else if(Math.abs(peak - getValue(match,text)) < Math.abs(peak - getValue(acca[toReplace].match,acca[toReplace].text)) )
				acca[toReplace] = new Bet(match, text, priority, peak);
		}
	}
}
function isWithinRange(value, lowerRange, upperRange){

	return value <= upperRange && value >= lowerRange;
}
function hasEnoughData(match,limit){

	return match.home.history.length > limit && match.away.history.length > limit;
}
function searchLowestPeakByPriority(acca, priority){
	var peak = -1;
	var maxDistance = -1;
	for(var i = 0 ; i < acca.length; i++){
		if(acca[i].priority == priority){
			if(peak == -1)
				peak = acca[i].peak;
			if(maxDistance == -1)
				maxDistance = i;
			else if(Math.abs(peak - getValue(acca[maxDistance].match, acca[maxDistance].text)) < Math.abs(peak - getValue(acca[i].match, acca[i].text)) )
				maxDistance == i
		}
	}
	return maxDistance;
}
function getValue(match, text){
	switch (true){
		case text.includes("Home"): return match.FT[0];
		case text.includes("Away"): return match.FT[2];
		case text.includes("2.5"): return match.O[2];
		case text.includes("1.5"): return match.O[1];
		case text.includes("GG"): return match.GG;
	}
}
function Bet(match, text, priority, peak){
	this.match = match;
	this.text = text;
	this.priority = priority;
	this.peak = peak;
}
