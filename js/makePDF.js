//a dumb module that makes PDF documents from existing story stuff.

'use strict';

 var docDefinition = {content: ['This is a standard paragraph, using default style',{ text: 'This paragraph will have a bigger font', fontSize: 15 },{text: ['This paragraph is defined as an array of elements to make it possible to ',{ text: 'restyle part of it and make it bigger ', fontSize: 15 },'than the rest.']}]};








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
		content: []
		};

	for (i=0; i<sections.length; i++) { //parse the text into html-readable segments because SECTIONS IS MADE NOW! YAY!
		if (window.sketchMode === true) {
			sections[i] = pdfSketchParser(sections[i]);
			pdfDocDef.content.push({ul : sections[i].source});
			if (i != (sections.length - 1)) {
				pdfDocDef.content[i].pageBreak = "after";
			}
		}
	}
	window.pdd = pdfDocDef
	pdfMake.createPdf(pdfDocDef).open();  //USE THIS ONLY WHEN READY FOR PRODUCTION


}



function pdfProductionparser (Section) {


}


function pdfSketchParser (Section) {
	var unes = Section.source;
	var i = 0;
	var s = 0;
	var heightRegEx = /.*(\r\n|\n)?/g;
	unes = unes.replace(/sketch>>(\n|\r\n)?/g, '');
	var itemArr = unes.match(heightRegEx);
	Section.source = itemArr;
	return Section;
};
