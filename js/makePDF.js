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
			act: {margin: [0, 10, 0, 0]}

		},
		pageMargins: [72,72],
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
					console.log(sections[i][s]);
				} else {
					delete sections[i][s].last;
				}
				pdfDocDef.content.push(sections[i][s]);
			}
		}
	}
	delete pdfDocDef.content[sections.length - 1].pagebreak;
	var d = sections[sections.length-1]
	delete d[d.length-1].pageBreak;
	//console.log(pdfDocDef);
	pdfMake.fonts = {CourierPrime: { normal: 'CourierPrime.ttf' }};
	
	if (print === true) {
		try {
			pdfMake.createPdf(pdfDocDef).print();  //USE THIS ONLY WHEN READY FOR PRODUCTION
		} catch(e) { alert("This feature is only available in Chrome at this time");}
		
	} else {
		pdfMake.createPdf(pdfDocDef).open();  //USE THIS ONLY WHEN READY FOR PRODUCTION
	}

}

function pdfProductionParser (Section) {
	var unes = _.unescape(Section.source); //unes is the unescaped source.

	unes = unes.replace(/\/\*.*\*\//g, '');
	// Remove // comments
	// to avoid clashes with URLs, lines must start with these
	unes = unes.replace(/^\/\/.*(\r\n|\n)?/g, '');
	var lineRegExp =/\w{3}>>(.*)(\r\n|\n)?/g;
	var sourceMatches = unes.match(lineRegExp); //returns an array of all line matches where the lines begin with itm>>.
	var manipstring = '';
	var lineObj = {};
	var i;
	var textExists = true;
	var lastItem;
	try {
		textExists = true;
		for (i=0; i < sourceMatches.length; i++) {
			manipstring = sourceMatches[i];
			var lineType = manipstring.substring(0,3);
			var lineContent = manipstring.substring(5);
			switch(lineType) {
				case "sch":
					lineContent = lineContent.toUpperCase();
					break;
				case "tra":
					lineContent = lineContent.toUpperCase();
					break;
				case "cha":
					lineContent = lineContent.toUpperCase();
					break;
				case "par":
					//This chunk of code is a smart parenthases parser that makes sure that parenthases are always there.
					var matches = lineContent.match(/\s?(\()?([^)]*)(\))?$/);
					switch (matches.length) { 
						case 1:
							lineContent = "(" + matches[0] + ")";
							break;
						case 2:
							if (matches[0] == "(") {
								lineContent = "(" + matches[1] + ")";
							} else {
								lineContent = "(" + matches[0] + ")";
							}
						break;

					}
				break;
			}
			if (i == (sourceMatches.length - 1)) {
				lastItem = true;
			} else {
				lastItem = false;
			}	
			lineObj = {text: lineContent, style: lineType, last : lastItem};
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
