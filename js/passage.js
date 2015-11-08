//note to self: always do a whitespace runthrough when code is written. It'll save your sanity.
'use strict';


function Passage (id, name, tags, source) {
	//the numeric id of the passage. Super importante. Number, readonly.
	this.id = id;
	
	//the name of the passage. Not as important. String.
	this.name = name;

	//the tags of the passage. Not used by me personally, but eh. Array.
	this.tags = tags;
	
	//The passage's source code. String.
	this.source = _.unescape(source);

	//a storage place for knowing if text exists in the passage
	this.textExists = false;

	//a storage place for knowing if links exist
	this.linkExists = false;
}


_.extend(Passage.prototype, {
	/*Stolen from Chris Klimas. 
	Runs the source through Underscore's template parser
	then through a Markdown renderer, then converts bracketed
	links into proper passage links.
	Returns the HTML source.
	This is where the magic happens.*/
	render: function() {
		if (window.bypassError === true) {
			window.bypassError = false; // make sure that the error handler is active.
		}
		var result = '';
		var unes = _.unescape(this.source); //unes is the unescaped source.
		unes = unes.replace(/\/\*.*\*\//g, '');
		// Remove // comments
		// to avoid clashes with URLs, lines must start with these
		unes = unes.replace(/^\/\/.*(\r\n?|\n)/g, '');

		//building the story sketch... Find out if we're in sketchmode to begin with.
		if (window.sketchMode === false) {
			if (unes.substring(0,8) == "sketch>>"){
				window.sketchMode = true; //flip the switch
				result = this._sketchMachine(unes);  //Takes the unescaped source and returns the completed text!
			} else {
				/*This is the code to execute if we're in production mode. we're looking for our own markup. Our format looks like this:
				itm>>text
				itm>>text */
				result = this._formatMachine(unes);//Takes the unescaped source and returns the completed text!
			} 
		} else { 
		//we're in sketch mode now. Sketchmode is a pretty simple concept. It just takes each line and turns it into an unordered list.
			result = this._sketchMachine(unes);  //Takes the unescaped source and returns the completed text!
		}
		result = this._linkMachine(result);
		if (this.textExists === true || this.linkExists === true) {
			result = this._pageParser(result); //Need to get things on the right number of pages. Also no need to do it if we've not nothing to parse.
		}
		return result;

	},
	

	//Helper functions are here. Technically all part of _.extend(Passage.prototype, { which is on line 27 at this time.
	/*
	(stolen from snowman) A helper function that is connected to passage templates as $. It acts like the jQuery $ function, running a script when the passage is ready in the DOM. The function passed is also bound to div#page for convenience. If this is *not* passed a single function, then this acts as a passthrough to jQuery's native $ function. @method _readyFunc @return jQuery object, as with jQuery() @private
	*/

	_readyFunc: function(){
		if (arguments.length == 1 && typeof arguments[0] == 'function'){
			return jQuery(window).one('showpassage:after', _.bind(arguments[0], jQuery('#page')));
		} else {
			return jQuery.apply(window, arguments);
		}
	},
	_formatMachine: function(original){
		var lineRegExp =/\w{3}>>(.+)(\r\n|\n)?/g;
		var sourceMatches = original.match(lineRegExp); //returns an array of all line matches where the lines begin with itm>>.
		var newSourceMatches = [];
		var manipstring = '';
		var linestring = '';
		var i;
		try {
			this.textExists = true;
			for (i=0; i < sourceMatches.length; i++) {
				manipstring = sourceMatches[i];
				var lineType = manipstring.substring(0,3);
				var lineContent = manipstring.substring(5);
				linestring = '<div id=\"' + lineType + 'Cont\">' + lineContent + "</div>\r\n";
				newSourceMatches[i] = linestring;
				original = original.replace(sourceMatches[i], newSourceMatches[i]);
			}
		} catch(err) {
			this.textExists = false;
		}
		if (this.linksExist === false && this.textExists === false) {	
			original = '<center><h1>(This passage has no data.)</h1></center>'; //error catching, yay! Also lazy HTML! Yay!
		}
		var holepunch = '<div id="holePunch"><h1 class="tophole">m</h1><h1 class="midhole">m</h1><h1 class="bothole">m</h1></div>'; //holepunches only need to be in production mode.
		return holepunch + original;

	},
	_sketchMachine: function(original) {
		if (original.slice(0,8) == "sketch>>" ) {
			original = original.slice(8);
		}
		window.derp = original;
		var lineRegExp =/.+(\r\n|\n)/g;
		var sourceMatches = original.match(lineRegExp); //returns an array of all lines.
		var newSourceMatches = [];
		var manipstring = '';
		var linestring = '';
		var i;
		try {
			this.textExists = true;
			for (i=0; i < sourceMatches.length; i++) {
				manipstring = sourceMatches[i];
				linestring = '<li>' + manipstring + "</li>\r\n";
				newSourceMatches[i] = linestring;
				original = original.replace(sourceMatches[i], newSourceMatches[i]);
			}
		} catch(err) {
			this.textExists = false;
		}
		return "<ul>" + original + "</ul>";
	},
	_linkMachine: function(original) { 	//insert code for links!
		var linkHunter = /\[\[(.*?)\]\]((\r\n|\n)*)/g;
		var linkMatches = original.match(linkHunter); //returns an array of all [[links]]  //future feature: except var>>... we'll put those somewhere else.
		//[[links]]... Snowman's link code made no goddamn sense... so I rewrote it. HAHA! (notes... add the newline possibility to the regex.)
		var finishedLink = [];
		var i;
		try {
			this.linksExist = true;
			for (i=0; i < linkMatches.length; i++) {
				var barIndex = linkMatches[i].indexOf('|');
				var endIndex = linkMatches[i].indexOf(']]');
				var display = linkMatches[i].slice(2, barIndex);
				var target = linkMatches[i].slice(barIndex + 1,endIndex);
				var newLine = linkMatches[i].slice(endIndex + 2); 
				if (/^\w+:\/\/\/?\w/i.test(target)) {
					finishedLink[i] = '<div id="linkCont"><a href="' + target + '">' + display + '</a>' + '</div>';
				} else {
					finishedLink[i] = '<div id="linkCont"><a href="javascript:void(0)" data-passage="' + _.escape(target) + '">' + display + '</a>' + '</div>';
				}
			original = original.replace(linkMatches[i], finishedLink[i]);
			}
		} catch(err) {
			this.linksExist = false;
		}
		return original;
	},
	_pageParser: function(original) { 
		/*This function automatically figures out how many pages that a passage uses and generates pages accordingly.
			*****KNOWN ISSUE*****
			The page parser can really only guess at what the final result will be, and it seems to find an arbitrary place
			to put the pagemaking code each time. I need to figure out an exact way for the parser to guess accurately.
			Until then, it works, just the distances between the pages and here the pages actually split seem arbitrary to the
			end user.
		*/
		var tempPassage = document.getElementById("passageConstruction");
		tempPassage.innerHTML = ""; //Element needs to be cleared out before we can begin.
		var tempHeight = 0;
		var i = 0;
		var heightRegEx = /.*(\r\n|\n)?/g;
		var itemArr = original.match(heightRegEx);
		var heightSubtractor = 0;
		var pageCounter = 1;
		var result = '';
		var pageDistance = [];
		//We need to build the "#passageConstruction" div line by line, test the height, and add pages based on that height. To do that, we need to make the tempPassage workable. AKA not display: hidden;
		tempPassage.style.position = "absolute";
		tempPassage.style.visibility = "visible";
		tempPassage.style.display = "block";
		tempPassage.style.width = "672px";
		tempPassage.style.left = "0px";
		tempPassage.style.top = "0px";
		for (i=0; i < itemArr.length; i++) {
			$("#passageConstruction").append(itemArr[i]);
			tempHeight = tempPassage.clientHeight;	
			if (tempHeight > 900) {
				pageDistance = 972 - tempHeight + 82;
				if (window.sketchMode === false) {
					itemArr[i-1] = itemArr[i-1].substring(0,itemArr[i-1].length -1) + "</div><br /><div id=\"page\" style=\"position:relative;left:-73px;top:" + pageDistance + "px;\">\n";
					tempPassage.innerHTML = ""; //Element needs to be cleared so we can start fresh with the new div.
					$("#passageConstruction").append(itemArr[i]);
				} else {
					itemArr[i-1] = itemArr[i-1].substring(0,itemArr[i-1].length -1) + "</ul></div><br /><div id=\"page\"style=\"position:relative;left:-73px;top:" + pageDistance + "px;\"><ul>\n";
					tempPassage.innerHTML = ""; //Element needs to be cleared so we can start fresh with the new div.
					$("#passageConstruction").append(itemArr[i]);
				}
				pageCounter = pageCounter + 1;
			}
		}
		
		i=0;
		for (i=0; i<itemArr.length; i++) {
			result = result + itemArr[i];		
		} 
		tempPassage.style.visibility = "hidden";
		tempPassage.style.display = "none";
		$(window).scrollTop(0); //it seems to work better here than anywhere else... go figure.
		return result;
	}
});


