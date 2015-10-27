//a dumb module that makes PDF documents from existing story stuff.

'use strict';


function makePDF(print) {

	var allContent = window.storyData[0];
	var a = allContent;
	var i = 0;
	var c = 0;
	var s = 0;
	var sectionName = '';
	var pasid=0;
	var tag='';
	var content = '';
	var sections = []; //an array containing objects containg all sections.
	/*
	proper format:
	[{name:"start",pid:1,tags:"",content:"stuff"},{name:"page2",pid:2,tags:"",content:"stuff"}] and so on and so forth...
	*/
	for (i=2; i < (a.childElementCount); i++) {
		sectionName = a.children[i].attributes.name.value;
		pasid = parseInt(a.children[i].attributes.pid.value);
		tag = a.children[i].attributes.tags.value;
		content = _.unescape(a.children[i].innerHTML);
		content = content.replace(/\/\*.*\*\//g, ''); //removes //comments
		content = content.replace(/^\/\/.*(\r\n?|\n)/g, ''); // to avoid clashes with URLs, lines must start with these
		sections[i-2] = {name:sectionName, pid: pasid, tags: tag, source: content};
	}

	for (i=0; i<sections.length; i++) { //parse the text into html-readable segments.
		if (window.sketchMode === false) {
			sections[i] = pdfProductionparser(sections[i]);
		} else {
			sections[i] = pdfSketchParser(sections[i]);
		}
	}
	var doc = new jsPDF();
	s = 0;
	for (i=0; i < sections.length; i++) {
		for (s=0; s < sections[i].source.length; s++) {
			sections[i].source[s] = sections[i].source[s].replace(/(\r\n?|\n)/g, '');
			eval(sections[i].source[s]);
		}
	}
	var rawdata = doc.output();
	console.log(rawdata);
	var len = rawdata.length,
	ab = new ArrayBuffer(len),
	u8 = new Uint8Array(ab);

	while(len--) u8[len] = rawdata.charCodeAt(len);
	var blob = new Blob([ab], { type : "application/pdf" });
	saveAs(blob, window.story.name + ".pdf");


	//var pdfBlob = new Blob(
		//[pdfData],
		//{type: 'application/pdf', encoding: 'raw'}
	//);
	//saveAs(pdfBlob, window.story.name + ".pdf");
}



function pdfProductionparser (Section) {


}


function pdfSketchParser (Section) {
	var result = '';
	var tempPassage = document.getElementById("passageConstruction");
	var unes = Section.source;
	tempPassage.innerHTML = "";
	var fromLeft = 27;
	var fromTop = 25;
	var tempHeight = 0;
	var tempWidth = 0; //jsPDF doesn't do autowrap... blech..
	var i = 0;
	var s = 0;
	var heightRegEx = /.*(\r\n|\n)?/g;
	var itemArr = unes.match(heightRegEx);
	var heightSubtractor = 0;
	var pageCounter = 1;
	var pageDistance = [];
	var oldstring = ''; //we're gonna abuse this var here.
	var newstring = '';
	var pageMarker = [];
	tempPassage.style.position = "absolute";
	tempPassage.style.visibility = "visible";
	tempPassage.style.display = "block";
	tempPassage.style.left = "0px";
	tempPassage.style.top = "0px";
	for (i=0; i<itemArr.length; i++) {
		for (s=0; s<itemArr[i].length; s++) {
			$("#passageConstruction").append(itemArr[i][s]);
			newstring = newstring + itemArr[i][s];
			tempWidth = tempPassage.clientWidth;

			if (tempWidth > 672) {
				newstring = newstring + "\r\n";
				tempPassage.innerHTML = "";
			}

		}
	}
	itemArr[i] = newstring;
	tempPassage.innerHTML = oldstring + newstring;
	oldstring = oldstring + newstring;
	tempHeight = tempPassage.clientHeight;	
	if (tempHeight > 900) {
		pageMarker = pageMarker.push(i);
		oldstring = '';
		newstring = '';
	}
	tempPassage.innerHTML = '';
	//Let's format this properly now.
	tempHeight = 0;
	for (i=0; i<itemArr.length; i++) {
		for (s=0; s<pageMarker.length; s++) {
			if (i == pageMarker[s]) {
				fromTop = 25;
			} 
		}
		tempPassage.innerHTML = itemArr[i];
		itemArr[i] = "doc.circle("+ (fromLeft - 3) + "," + fromTop + ",2,\"F\");doc.text(" + fromLeft + "," + fromTop + ",\"" + itemArr[i] + "\");";
		tempHeight = tempPassage.clientHeight;
		fromTop = tempHeight + fromTop;
	}

	//Now to put in the page breaks.
	for (i=0; i<pageMarker.length; i++) {
		itemArr.splice(pageMarker[i],1,"doc.addPage();");
	}

	Section.source = itemArr;
	return Section;
}
