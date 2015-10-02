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
}


_.extend(Passage.prototype, {
	/*Stolen from Chris Klimas. 
	Runs the source through Underscore's template parser
	then through a Markdown renderer, then converts bracketed
	links into proper passage links.
	Returns the HTML source.
	This is where the magic happens.*/
	render: function() {
		var unes = _.template(_.unescape(this.source), { s: window.story.state, $: this._readyFunc }); //unes is the unescaped source.
		unes = unes.replace(/\/\*.*\*\//g, '');
		// Remove // comments
		// to avoid clashes with URLs, lines must start with these
		unes = unes.replace(/^\/\/.*(\r\n?|\n)/g, '');

		/*Here's where we start to differ from snowman. They're looking for items to start with BBS notation, we're looking for our own deal.
		Our format looks like this:
			itm>>text
			itm>>text
		*/

		var result = this._formatMachine(unes); //Takes both arrays and returns the completed text!
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
	_formatMachine: function(original){ //note to self: make regex to turn js newlines into HTML newlines... may help!
		var lineRegExp =/\w{3}>>(.+)(\r\n?|\n)/g;
		var sourceMatches = original.match(lineRegExp); //returns an array of all line matches where the lines begin with itm>>.
		var newSourceMatches = [];
		var manipstring = '';
		var linestring = '';
		var i;
		var linksExist;
		var textExists;
		try {
			textExists = true;
			for (i=0; i < sourceMatches.length; i++) {
				manipstring = sourceMatches[i];
				var lineType = manipstring.substring(0,3);
				var lineContent = manipstring.substring(5);
				linestring = '<div id=\"' + lineType + 'Cont\">' + lineContent + "</div>\r\n";
				newSourceMatches[i] = linestring;
				original = original.replace(sourceMatches[i], newSourceMatches[i]);
			}
		} catch(err) {
			textExists = false;
		}
		var linkHunter = /\[\[(.*?)\]\]((\r\n?|\n)*)/g;
		var linkMatches = original.match(linkHunter); //returns an array of all [[links]]  //future feature: except var>>... we'll put those somewhere else.
		//[[links]]... Snowman's link code made no goddamn sense... so I rewrote it. HAHA! (notes... add the newline possibility to the regex.)
		var finishedLink = [];
		try {
			linksExist = true;
			for (i=0; i < linkMatches.length; i++) {
				var barIndex = linkMatches[i].indexOf('|');
				var endIndex = linkMatches[i].indexOf(']]');
				var display = linkMatches[i].slice(2, barIndex);
				var target = linkMatches[i].slice(barIndex + 1,endIndex);
				var newLine = linkMatches[i].slice(endIndex + 2); 
				if (/^\w+:\/\/\/?\w/i.test(target)) {
					finishedLink[i] = '<a href="' + target + '">' + display + '</a>' + '<br>';
				} else {
					finishedLink[i] = '<a href="javascript:void(0)" data-passage="' + _.escape(target) + '">' + display + '</a>' + '<br>';
				}
			original = original.replace(linkMatches[i], finishedLink[i]);
			}
		} catch(err) {
			linksExist = false;
		}


		if (linksExist === false && textExists === false) {	
			original = '<center><h1>(This passage has no data.)</h1></center>'; //error catching, yay! Also lazy HTML! Yay!
		}

	return original;

	},
});
