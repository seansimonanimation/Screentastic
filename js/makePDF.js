/*
 An object representing the entire story. When called, an instance of this class will be available at `window.story`. @class Story @constructor. stolen from Chris Klimas, with some modifications.
*/

'use strict';

function PDF(el) {

// set up basic properties

	this.el = el;
	/*
	 The name of the story. @property name @type String @readonly
	*/
	this.name = el.attr('name');
	/*
	 The ID of the first passage to be displayed. @property startPassage @type Number @readonly
	*/
	this.startPassage = parseInt(el.attr('startnode'));
	/*
	 The program that created this story. @property creator @type String @readonly
	*/
	this.creator = el.attr('creator');
	/*
	 The version of the program used to create this story. @property creatorVersion @type String @readOnly
	*/
	this.creatorVersion = el.attr('creator-version');
	/*
	 If set to true, then any JavaScript errors are ignored -- normally, play would end with a message shown to the user.  @property ignoreErrors @type Boolean
	*/
	this.ignoreErrors = false;
	/*
	 The message shown to users when there is an error and ignoreErrors is not true. Any %s in the message will be interpolated as the actual error messsage. @property errorMessage @type String
	*/
	this.errorMessage = '\u26a0 %s';
	// create passage objects
	/*
	 An array of all passages, indexed by ID. @property passages @type Array
	 For Print mode, let's call them "Sections", just to help mentally separate them from onscreen passages. This section helps make the translation, as well as manages the data dump.
	*/
	this.sections = [];
	var s = this.sections;
	el.children('tw-passagedata').each(function (el){
		var $t = $(this);
		var id = parseInt($t.attr('pid'));
		var tags = $t.attr('tags');

		s[id] = new Section(id, $t.attr('name'), (tags !== '' && tags !== undefined) ? tags.split(' ') : [], $t.html());
	});
	/*
	 Screentastic has no special place for user scripts. All styling is already laid out by the WGA.
	Instead, we'll set up the PDF document in PDF space.
	*/

	//A Variable telling us whether or not we have a title page.
	this.titlePage = false;

}

_.extend(PDF.prototype, {
	/*
	 Begins making the PDF.

	 @method make
	*/

	make: function() {
		// set up error handler

		window.onerror = function (message, url, line){
			if (! this.errorMessage || typeof(this.errorMessage) != 'string')
				this.errorMessage = PDF.prototype.errorMessage;

			if (! this.ignoreErrors)
			{
				if (url)
				{
					message += ' (' + url;

					if (line)
						message += ': ' + line;

					message += ')';
				}

				alert('%s', message);	
			}
		}.bind(this);
		//begin building the PDF document.
		var storyData = window.PDF.sections;
		var pdfData = this.buildPDF(storyData);
		var pdfBlob = new Blob(
			[pdfData],
			{type: 'application/pdf', encoding: 'raw'}
		);
		saveAs(pdfBlob, window.story.name + ".pdf");

	},
	/*
	 Returns the Section object corresponding to either an ID or name. If none exists, then it returns null. @method passage @param idOrName {String or Number} ID or name of the passage @return Passage object or null
	*/
	section: function (idOrName)
	{
		if (_.isNumber(idOrName))
			return this.passages[idOrName];
		else if (_.isString(idOrName))
			return _.findWhere(this.passages, { name: idOrName });
	},


	//Builds the PDF Data so that it can be saved. Returns a string.
	buildPDF: function (storyData) {
		var pdfSecs = $.extend(true, [], PDF.sections);
		var doc = new jsPDF();
		// If the "titlePage" Passage exists, let's put that in front. That's our title page.
		var i = 1;
		var s = 0; //Renderer's gonna generate nested arrays. Need to parse that properly.
		var sourceArray = [];


		if (window.sketchMode === false) { //We're in production mode!
			for (i = 1; i < pdfSecs.length - 1; i++) {
				if (pdfSecs[i].name == "titlePage") {
					this.titlePage = true;
					pdfSecs[0] = pdfSecs[i];
					pdfSecs.slice(i,1);
				}
			}

			// Now for the fun bit. This section of code here takes the source from each passage and converts it to a jsPDF execution.
		
			for (i = 0; i < pdfSecs.length ; i++) {
				if (pdfSecs[i].name == "titlePage") {
					sourceArray[i] = Section.titlePageRender(pdfSecs[i]);
					//format: 
				} else {
					sourceArray[i] = Section.pageRender(pdfSecs[i]);
				}
			}
		} else { //We're in sketch mode now!
			for (i = 1; i < pdfSecs.length - 1; i++) {
				if (pdfSecs[i].name == "titlePage") {
					this.titlePage = true;
					pdfSecs.slice(i,1); //There's no need for a title page in sketch mode.
				}
			}
			for (i = 0; i < pdfSecs.length ; i++) {
				sourceArray[i] = Section.pageRender(pdfSecs[i]);
			}
		}
		//now run each line of the sourceArray var through eval();
		for (i=0; i<sourceArray[i].length; i++) {
			for (s=0; sourceArray[i][s].length; s++) {
				eval(sourceArray[i][s]); //evaluate that string y'awll!
			}
		}
		return doc;

	}, //shouldn't be a need for this bit, but I feel like I missed something, so I'm keeping it in.
	render: function (idOrName)
	{
		var section = this.section(idOrName);

		if (! section)
			throw new Error('There is no passage with the ID or name ' + idOrName);

		return section.render();
	},

});

