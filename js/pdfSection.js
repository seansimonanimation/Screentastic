//note to self: always do a whitespace runthrough when code is written. It'll save your sanity.
'use strict';

function Section (id, name, tags, source) {
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


_.extend(Section.prototype, {



	titlePageRender: function (source) {
		var result = '';
		var unes = _.template(_.unescape(source));
	},








	pageRender: function (source) {
		var result = '';
		var unes = _.template(_.unescape(source));

		// Remove // comments
		unes = unes.replace(/\/\*.*\*\//g, '');

		// to avoid clashes with URLs, lines must start with these
		unes = unes.replace(/^\/\/.*(\r\n?|\n)/g, '');


		if (window.sketchMode === true) {

			//we're in sketch mode now. Sketchmode is a pretty simple concept. It just takes each line and turns it into an unordered list.

			result = this._sketchMachine(unes);//Takes the unescaped source and returns the completed text, in the proper format!
		} else { 

			/*This is the code to execute if we're in production mode. we're looking for our own markup. Our format looks like this:
			itm>>text
			itm>>text */

			result = this._formatMachine(unes);  //Takes the unescaped source and returns the completed text, in the proper format!
		}
		result = this._linkMachine(result);
		if (this.textExists === true || this.linkExists === true) {
			result = this._pageParser(result); //Need to get things on the right number of pages. Also no need to do it if we've not nothing to parse.
		}
		return result;
	},


	//Helper functions are here. Technically all part of _.extend(Section.prototype, { which is on line 27 at this time.


	_formatMachine: function(original){      //Remember: We're using jsPDF as our parser. Check up on the documentation.
		
	},

	_linkMachine: function(original) { 	//insert code for links!

	},

	_pageParser: function(original) { 
		//This function automatically figures out how many pages that a passage uses and generates pages accordingly.
	},
});
