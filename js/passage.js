//note to self: always do a whitespace runthrough when code is written. It'll save your sanity.
'use strict';


function Passage (id, name, tags, source) {
	//the numeric id of the passage. Super importante. Number, readonly.
	this.id = id;
	
	//the name of the passage. Not as important. String.
	this.name = name;

	//the tags of the passage. Not used by me personally, but eh. Array.
	this.tags = tags;
	
	//The passage's source code. Returns an array that later becomes a string during inital processing.
	this.source = source;
	this.stack = [];
	//a storage place for knowing if text exists in the passage
	this.textExists = false;

	//a storage place for knowing if links exist
	this.linkExists = false;

	//a storage place for the page height, for knowing if we need to add pages.
	this.pageHeight = 0;

}


_.extend(Passage.prototype, {


	parsePassage: function(){
		//this is the code that actually throws the stuff on screen
		if (window.story.sketchMode === false){
			this.stack = this._productionParser(_.unescape(this.source));
		} else {
			this.stack =  this._sketchParser(_.unescape(this.source));
		}
		var passageDef = {
			content: this.stack,
			defaultStyle: window.story.defaultStyle,
			styles: window.story.styles,
			pageMargins: window.story.pageMargins,
			pageSize: window.story.pageSize
		};
		var parsedObj = pdfMake.createPdf(passageDef);
		window.bypassError = true;		
		parsedObj._createDoc();

	},


	screenRender: function(){
		//this is the code that actually formats the stuff that gets thrown up on screen. when testing, it always returns "derp"
	var testing = false;
	var stack = this.stack;
	var i;
	var s;
	var currentPage = 1;
	var fullBring = ''; //The concatenated var containing the full, rendered passage, complete with HTML markup. Also, a Bleach reference :D
	for (i=0; i<stack.length; i++){   //.ul[0].text



		if (stack[i].style == "sketch"){        //sketch, link, sch, tra, act,  dia, cha, par, more.
			if (i === 0 || stack[i-1].style != "sketch"){
				fullBring = fullBring + "<ul>";
			}

			for (s=0; s<stack[i].ul.length; s++){
				fullBring = fullBring + "<li>" + stack[i].ul[s].text + "</li>";
			}
			if (!stack[i+1] || stack[i+1].style != "sketch"){
				fullBring = fullBring + "</ul>";
			}
			for (s=0; s<stack[i].positions.length; s++){
				if (stack[i].positions[s].pageNumber > currentPage) {
					fullBring = fullBring + "</ul></div><br /><div id=\"page\" style=\"position:relative;left:-73px;top:100px;\"><ul>";
					currentPage = stack[i].positions[s].pageNumber;
				}
			}
		} else if (stack[i].style == "link"){
			var target = stack[i].target;
			var display = stack[i].text;

			if (/^\w+:\/\/\/?\w/i.test(target)) {
				fullBring = fullBring + '<div id="linkCont"><a href="' + target + '">' + display + '</a>' + '</div>';
			} else {
				fullBring = fullBring + '<div id="linkCont"><a href="javascript:void(0)" data-passage="' + _.escape(target) + '">' + _.escape(display) + '</a>' + '</div>';
			}
		} else if (stack[i].style == "sch"){

		} else if (stack[i].style == "tra"){

		} else if (stack[i].style == "act"){

		} else if (stack[i].style == "dia"){

		} else if (stack[i].style == "cha"){

		} else if (stack[i].style == "par"){

		}
	}

	if (testing === true){
		return "derp";
	} else {
		return fullBring;
	}

	},




	//Helper functions are here. They are methods of Passage.
	/*
	 A helper function that is connected to passage templates as $. It acts like the jQuery $ function, running a script when the passage is ready in the DOM. The function passed is also bound to div#page for convenience. If this is *not* passed a single function, then this acts as a passthrough to jQuery's native $ function. @method _readyFunc @return jQuery object, as with jQuery() @private
	*/



	_productionParser: function(original){
	//Takes the original, unescaped string and turns it into an object array.
		var lineRegExpG =/^((\w{3})(>>)(.*)$|\[\[(.*?)\|(.*?)\]\]$)/gm; //both the link grabber and the text grabber combined!
		var lineRegExpL = /^((\w{3})(>>)(.*)$|\[\[(.*?)\|(.*?)\]\]$)/;
		var sourceMatches = original.match(lineRegExpG); //returns an array of all line matches where the lines begin with itm>> or are links.
		var i;
		for (i=0; i<sourceMatches.length; i++){
		//turns the array items into un-undefined arrays.
			sourceMatches[i] = sourceMatches[i].match(lineRegExpL);
			delete sourceMatches[i][0];
			sourceMatches[i] = $.grep(sourceMatches[i],function(n){ return(n); });//kills all the undefineds. 
			if (sourceMatches[i].length == 4) { 
			//regular items should have 4 items in their array at this point. Format: ["dia>>HAHA! HI!", "dia", ">>", "HAHA! HI!"]
				sourceMatches[i] = {text: sourceMatches[i][3], style: sourceMatches[i][1]};
			} else if (sourceMatches[i].length == 3){
			//regular items should have 4 items in their array at this point. Format: ["[[target|display]]","target","display"]
				sourceMatches[i] = {text: sourceMatches[i][1], target: sourceMatches[i][2], style: "link"};

			} else {
				sourceMatches[i] = {text: "There is a problem with this item.", style: "err"};
			}
		}
		return sourceMatches;
	},
	_sketchParser: (function(original) {
		if (original.slice(0,8) == "sketch>>" ) {
			original = original.slice(8);
		}
//		console.log(original);
		var globalLineReg = /(^\[\[(.*?)\|(.*?)\]\]$|^.+$)/gm;
		var localLineReg  = /(^\[\[(.*?)\|(.*?)\]\]$|^.+$)/;
		var sourceMatches = original.match(globalLineReg); //returns an array of all lines and links.
		var i;

		for (i=0; i<sourceMatches.length; i++){
			sourceMatches[i] = sourceMatches[i].match(localLineReg);
			delete sourceMatches[i][0];
			sourceMatches[i] = $.grep(sourceMatches[i],function(n){ return(n); });//kills all the undefineds. 
			if (sourceMatches[i].length == 3) {
				sourceMatches[i] = {text: sourceMatches[i][1], target: sourceMatches[i][2], style: "link"};
			} else {
				sourceMatches[i] = {ul: sourceMatches[i], style: "sketch"};
			}
		}
		return sourceMatches;
	}),
	_linkMachine: (function(original) { 	//insert code for links!
		var linkHunter = /\[\[(.*?)\]\]((\r\n|\n)*)/;
		var liMat = original.match(linkHunter)[1]; //returns a string of "display|target"
		var finishedLink;
		//[[links]]... Snowman's link code made no goddamn sense... so I rewrote it. HAHA! (notes... add the newline possibility to the regex.)
		try {
			this.linksExist = true;
			var display = liMat.slice(0, liMat.indexOf('|')); //second index to bar
			var target = liMat.slice(liMat.indexOf('|') + 1); //bar to last.
			if (/^\w+:\/\/\/?\w/i.test(target)) {
				finishedLink = '<div id="linkCont"><a href="' + target + '">' + display + '</a>' + '</div>';
			} else {
				finishedLink = '<div id="linkCont"><a href="javascript:void(0)" data-passage="' + _.escape(target) + '">' + _.escape(display) + '</a>' + '</div>';
			}
			
		} catch(err) {
			this.linksExist = false;
		}
		return finishedLink;
	}),


	_pageParser: (function(t, c, w) { //t=type, c=content, w=width //obsolete.
		//This function automatically figures out how many pages that a passage uses and generates pages accordingly.
		var npAtFront = false;
		var result = '';
		//console.log(c.length);

		if (t == "cha" || t== "act" ||t == "sch" || t == "tra" || t == "link" || t == "sketch") {
			this.pageHeight++;
			if (this.pageHeight >=90){
				npAtFront = true;
			} else {
				npAtFront = false;
			}
		}
		if (npAtFront === true) {
			this.pageHeight = 0;
		}
		var i = 0;
		var s = 0; //s is a dummy iterator, so we can build the array as needed without being limited to c(ontent).length
		var lineArr = []; //an array holding each line.
		for (i=0; i<c.length;i+=w) {
			if (i===0){
				lineArr[s] = c.substring(0,w);
			} else {
				lineArr[s] = c.substring(i,w+i);
			}
			//console.log(c);
			s++;
			this.pageHeight++;
			//console.log(this.pageHeight);
			
			if (this.pageHeight>=90) {
				if (window.story.sketchMode === false){
					lineArr[s] = "</div><div id=\"moreCont\">[MORE]</div></div><br /><div id=\"page\" style=\"position:relative;left:-100px;top:100px;\"><div id=\"holePunch\"><h1 class=\"tophole\">m</h1><h1 class=\"midhole\">m</h1><h1 class=\"bothole\">m</h1></div><div id=\"" + t +"\">";
				} else {
					console.log(t);
					lineArr[s] = "</div><br /><div id=\"page\" style=\"position:relative;left:-100px;top:100px;\"><li>" + t;
				}
				s++;
				this.pageHeight = 0;
			}
		}
		if (npAtFront === true) {
			if (window.story.sketchMode === false) {
				return ")(<div id=\"page\" style=\"position:relative;left:-73px;top:83px;\"><div id=\"holePunch\"><h1 class=\"tophole\">m</h1><h1 class=\"midhole\">m</h1><h1 class=\"bothole\">m</h1></div><div id=\"" + t + "\">" + lineArr.join(""); //The )( is so we can easily tell it later.
			} else {
				return "</ul><div id=\"page\" style=\"position:relative;left:-73px;top:83px;\"><div id=\"" + t + "\"><ul><li>" + lineArr.join("");
			}
		} else {
			return lineArr.join("");
		}
	})
});


