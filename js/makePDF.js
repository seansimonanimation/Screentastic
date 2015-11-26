//a dumb module that makes PDF documents from existing story stuff.

'use strict';

 //var docDefinition = {content: ['This is a standard paragraph, using default style',{ text: 'This paragraph will have a bigger font', fontSize: 15 },{text: ['This paragraph is defined as an array of elements to make it possible to ',{ text: 'restyle part of it and make it bigger ', fontSize: 15 },'than the rest.']}]};




function makePDF(print) {	
	var allContent = window.storyData[0];
	var a = allContent;
	var i = 0;
	var c = 0;
	var s = 0;
	var ss = 0;
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
			sketch : {margin: [ 0,0,-25,0 ]},
			sch: {margin: [0, 10, 0, 0]},
			tra: {
				alignment: "right",
				margin: [0,10, 0, 0]
			},
			cha: {	margin: [190, 10, 144, 0]},
			dia: {	margin: [110, 0, 110, 0], width: 324},
			act: {	margin: [0, 10, 0, 0]},
			par: {	margin: [144,0,110,0]},
			link: {
				fontSize: 16,
				margin: [0,20,0,0]
			},
		},
		pageMargins: [70,70],
		pageSize: 'LETTER',
	};
	var runningTotal = 0;
	for (i=0; i<sections.length; i++) { //parse the text into html-readable segments because SECTIONS IS MADE NOW! YAY!
		if (window.sketchMode === true) {
			sections[i] = pdfSketchParser(sections[i]);
			pdfDocDef.content.push({ul : sections[i].source, style: 'sketch', name: sections[i].name}); //In sketch mode, it's a simple unordered list.
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
	pdfMake.fonts = {CourierPrime: { normal: 'CourierPrime.ttf' }};
	console.log(pdfDocDef);
	var docuObj = pdfMake.createPdf(pdfDocDef);
	//docuObj._createDoc(); //_createDoc() method makes essentially does the hard math for ya. This puppy was a BITCH to find.
	//console.log(docuObj);
	if (window.sketchMode === true) { //Time to make the links match the page numbers.
		i = 0; //iterations
		s = 0; //subiterations
		ss = 0; //sub-sub-iterations
		var linkRegex = /\[\[(.*?)\]\](\r\n|\n)?/;
		//links time!
		var manipstring;
		var barIndex;
		var endIndex;
		var target;
		var lineContent;
		var targetPage;
		for (i=0; i<docuObj.docDefinition.content.length; i++) {
			for (s=0; s<docuObj.docDefinition.content[i].ul.length; s++) {
				if (docuObj.docDefinition.content[i].ul[s].text.substring(0,2) === "[[") {
					manipstring = docuObj.docDefinition.content[i].ul[s].text;
					barIndex = manipstring.indexOf('|');
					endIndex = manipstring.indexOf(']]');
					target = manipstring.slice(barIndex + 1,endIndex);
					lineContent = manipstring.slice(2, barIndex);
					console.log(docuObj);
					for (ss=0; ss<docuObj.docDefinition.content.length; ss++) { //target to the correct page.
						if (docuObj.docDefinition.content[ss].name == target) {
							docuObj.docDefinition.content[i].ul[s].text = "To " + lineContent + ", go to page " + JSON.stringify(docuObj.docDefinition.content[ss].positions[0].pageNumber) + "."; 
						}
						console.log(docuObj.docDefinition.content[i].ul[s].text);
					}
				}
			}
		}
		//console.log(docuObj.docDefinition.content[0].ul[0].text);
		
	} else { //sketchmode's off.
		delete pdfDocDef.content[sections.length - 1].pagebreak;
		var d = sections[sections.length-1];
		delete d[d.length-1].pageBreak;
		i = 0; //iterations
		s = 0; //subiterations
		ss = 0; //sub-sub-iterations
		var prevPage = 1;
		var currPage = 1;
		for (i=0; i<docuObj.docDefinition.content.length; i++) {
			for (s=0; s<docuObj.docDefinition.content[i].positions.length; s++) {
				//bypassing a bug where pdfmake forgets to do text wrapping on page 2.
				currPage = docuObj.docDefinition.content[i].positions[s].pageNumber;
				if (currPage != prevPage) {
					if (!docuObj.docDefinition.content[i-1].pageBreak) { //Don't wanna do double pagebreaks.
						if (docuObj.docDefinition.content[i].style == "act") {
							docuObj.docDefinition.content[i].pageBreak = "before";
						} else if (docuObj.docDefinition.content[i].style == "cha") {
							docuObj.docDefinition.content[i].pageBreak = "before";
						} else if (docuObj.docDefinition.content[i].style == "dia") {
							if (docuObj.docDefinition.content[i-1].style == "par") {
								docuObj.docDefinition.content[i-2].pageBreak = "before";
							} else {
								docuObj.docDefinition.content[i-1].pageBreak = "before";
							}
 						} else if (docuObj.docDefinition.content[i].style == "sch") {
							docuObj.docDefinition.content[i].pageBreak = "before";
						} else if (docuObj.docDefinition.content[i].style == "tra") {
							docuObj.docDefinition.content[i].pageBreak = "after";
						} else if (docuObj.docDefinition.content[i].style == "par") {
							docuObj.docDefinition.content[i-1].pageBreak = "before";
						}
					}
				}
				prevPage = currPage;
			}
		}
		for (i=0; i<docuObj.docDefinition.content.length; i++) {
			if (docuObj.docDefinition.content[i].style == "link") {// make the links work.
				for (s=0; s<docuObj.docDefinition.content.length; s++) {
					if (docuObj.docDefinition.content[s].bookmark == docuObj.docDefinition.content[i].target) {
							docuObj.docDefinition.content[i].text = docuObj.docDefinition.content[i].text + docuObj.docDefinition.content[s].positions[0].pageNumber + "."; 
					}
				}
			}
		}
	}
	if (print === true) {
		try {
			pdfMake.createPdf(pdfDocDef).print();  //USE THIS ONLY WHEN READY FOR PRODUCTION
		} catch(e) { alert("This feature is only available in Chrome at this time");}

	} else {
		try {
			console.log(docuObj);
			docuObj.open();
		} catch (e) {alert("There has been a problem. Please temporarily disable your popup blocker and refresh the page to continue.");}
	}
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
