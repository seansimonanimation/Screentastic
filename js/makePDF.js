//a dumb module that makes PDF documents from existing story stuff.

'use strict';

 //var docDefinition = {content: ['This is a standard paragraph, using default style',{ text: 'This paragraph will have a bigger font', fontSize: 15 },{text: ['This paragraph is defined as an array of elements to make it possible to ',{ text: 'restyle part of it and make it bigger ', fontSize: 15 },'than the rest.']}]};




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
		content = content.replace(/^\/\/.*(\r\n|\n)?/g, ''); // to avoid clashes with URLs, lines must start with these
		sections[i-2] = {name:sectionName, pid: pasid, tags: tag, source: content};
	}

	var pdfDocDef = {
		content: [],
		defaultStyle: { font: 'CourierPrime' },
		styles: {
			//sketchItem : {
				//margin: [ 0,0,-25,0 ]
			//}
			sch: {margin: [0, 10, 0, 0]},
			tra: {
				alignment: "right",
				margin: [0,10, 0, 0]
			},
			cha: {margin: [190, 10, 144, 0]},
			dia: {margin: [110, 0, 110, 0]},
			act: {margin: [0, 10, 0, 0]},
			par: {margin: [144,0,110,0]}

		},
		pageMargins: [70,70],
		pageSize: 'LETTER',
	};
	var runningTotal = 0;
	for (i=0; i<sections.length; i++) { //parse the text into html-readable segments because SECTIONS IS MADE NOW! YAY!
		if (window.sketchMode === true) {
			sections[i] = pdfSketchParser(sections[i]);
			pdfDocDef.content.push({ul : sections[i].source, style: 'sketch'}); //In sketch mode, it's a simple unordered list.
			//pdfDocDef.content[i].style = "sketchItem";
			if (i != (sections.length - 1)) {
				pdfDocDef.content[i].pageBreak = "after";

			}
		} else {
			sections[i] = pdfProductionParser(sections[i]);
			//In production mode, each item is its own object with its own style and placement needs.
			for (s=0; s<sections[i].length; s++) {
				if (sections[i][s].last === true) {
					sections[i][s].pageBreak = "after";
					delete sections[i][s].last;
				} else {
					delete sections[i][s].last;
				}
				pdfDocDef.content.push(sections[i][s]);
			}
		}
	}
	delete pdfDocDef.content[sections.length - 1].pagebreak;
	var d = sections[sections.length-1];
	delete d[d.length-1].pageBreak;
	i = 0;
	s = 0;
	pdfMake.fonts = {CourierPrime: { normal: 'CourierPrime.ttf' }};
	//pdfMake.createPdf(pdfDocDef);
	/*if (window.sketchMode === true) { //Time to make the links match the page numbers.


	} else { //sketchmode's off.
		for (i=0; i<pdfDocDef.content.length; i++) {
			if (pdfDocDef.content[i].style == "link") {
				for (s=0; i<pdfDocDef.content.length; s++) {
					if (pdfDocDef.content[s].bookmark == pdfDocDef.content[i].target) {
						pdfDocDef.content[i].text = pdfDocDef.content[i].text + pdfDocDef.content[s].positions[0].pageNumber + "."; 
					}
				}
			}
		}
	}
*/

	if (print === true) {
		try {
			pdfMake.createPdf(pdfDocDef).print();  //USE THIS ONLY WHEN READY FOR PRODUCTION
		} catch(e) { alert("This feature is only available in Chrome at this time");}
		
	} else {
		//pdfMake.createPdf(pdfDocDef).open();  //USE THIS ONLY WHEN READY FOR PRODUCTION
	}
	console.log(pdfDocDef);
	window.pdfDocDef = pdfDocDef;
}

function pdfProductionParser (Section) {

	var unes = _.unescape(Section.source); //unes is the unescaped source.
	unes = unes.replace(/\/\*.*\*\//g, '');
	// Remove // comments
	// to avoid clashes with URLs, lines must start with these
	unes = unes.replace(/^\/\/.*(\r\n|\n)?/g, '');
	var lineRegExp =/(\w{3}>>(.*)(\r\n|\n)?|\[\[(.*?)\]\](\r\n|\n)?)/g; //both the link grabber and the text grabber combined!
	var sourceMatches = unes.match(lineRegExp); //returns an array of all line matches where the lines begin with itm>>.
	var manipstring = '';
	var lineObj = {};
	var i;
	var textExists = true;
	var lastItem;
	var lineType;
	var lineContent;
	var target;
	var targetBookmark;

	try {
		textExists = true;
		for (i=0; i < sourceMatches.length; i++) {
			manipstring = sourceMatches[i];
			if (manipstring.substring(0,2) == "[[")  { //It's a link!
				lineType = "link";
				var barIndex = manipstring.indexOf('|');
				var endIndex = manipstring.indexOf(']]');
				targetBookmark = manipstring.slice(barIndex + 1,endIndex);
				lineContent = manipstring.slice(2, barIndex);
			} else {
				lineType = manipstring.substring(0,3);
				lineContent = manipstring.substring(5);
			}
			if (lineType == "sch") {
				lineContent = lineContent.toUpperCase();
			} else if (lineType == "tra") {
				lineContent = lineContent.toUpperCase();
			} else if (lineType == "cha") {
				lineContent = lineContent.toUpperCase();
			} else if (lineType == "par") { //This chunk of code is a smart parenthases parser that makes sure that parenthases are always there.
				var matches = lineContent.match(/\s?(\()?([^)]*)(\))?$/); 
				if (matches.length == 1) {
					lineContent = "(" + lineContent + ")";
				} else if (matches.length == 2) {
					if (matches[0] == "(") {
						lineContent =  lineContent + ")";
					} else {
						lineContent = "(" + lineContent;
					}
				}

			} else if (lineType == "dia") {


			} else if (lineType == "act") {

			} else if (lineType == "link") {
				lineContent = lineContent + ": Please go to page ";
			} else { //error
				lineContent = "(There has been an error in your markup descriptor) " + lineType + ">> " + lineContent;
			}


			if (i == (sourceMatches.length - 1)) {
				lastItem = true;
			} else {
				lastItem = false;
			}


			if (lineType == "link") {
				if (i === 0) {
					lineObj = {text: lineContent, style: lineType, target: targetBookmark, last : lastItem, bookmark: Section.name};	
				} else {
					lineObj = {text: lineContent, style: lineType, target: targetBookmark, last : lastItem};
				}
			} else {
				if (i === 0) {
					lineObj = {text: lineContent, style: lineType, last : lastItem, bookmark: Section.name};	
				} else {
					lineObj = {text: lineContent, style: lineType, last : lastItem};
				}
			}
			sourceMatches[i] = lineObj;
		}
	} catch(err) {
		textExists = false;
	}
	if (textExists === false) {	
		sourceMatches = {text: "This section contains no data."}; //error catching, yay! Also lazy HTML! Yay!
	}
	return sourceMatches;
}


function pdfSketchParser (Section) {
	var unes = Section.source;
	var i = 0;
	var s = 0;
	var heightRegEx = /.*(\r\n|\n)?/g;
	unes = unes.replace(/sketch>>.*(\n|\r\n)?/g, '');
	var itemArr = unes.match(heightRegEx);
	Section.source = itemArr;
	return Section;
};
