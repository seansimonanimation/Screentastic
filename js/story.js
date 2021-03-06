/*
 An object representing the entire story. After the document has completed loading, an instance of this class will be available at `window.story`. @class Story @constructor. stolen from Chris Klimas, with some modifications.
*/

'use strict';
	// el = element? This is the snowman var name, so I'm guessing here.


function Story (raw){
	// set up basic properties. We'll structure this so that both screen mode and the PDF maker can pull this data.

	//Here are some statics, but they need to be added to the object for the PDF stuff.
	
	this.defaultStyle = { font: 'CourierPrime' };
	this.styles = {
		sketch : {margin: [ 0,0,-25,0 ]},
		sch: {margin: [0, 10, 0, 0]},
		tra: {
			alignment: "right",
			margin: [0,10, 0, 0]
		},
		cha: {	margin: [190, 10, 144, 0]},
		dia: {	margin: [130, 0, 200, 0], width: 324},
		act: {	margin: [0, 10, 0, 0]},
		par: {	margin: [144,0,110,0]},
		link: {
			fontSize: 16,
			margin: [0,20,0,0]
		}
	};
	this.pageMargins = [70,70];
	this.pageSize = "LETTER";


	//raw is new Story($('tw-storydata')); AKA all the stuff inside the <tw-storydata> DOM element. We won't change this so we can have a pure copy of the data to pull from at all times.
	this.raw = raw;
	 //The name of the story. @property name @type String @readonly
	this.name = raw.attr('name');
	/*
	 The ID of the first passage to be displayed. @property startPassage @type Number @readonly
	*/
	this.startPassage = parseInt(raw.attr('startnode'));

	//The program that created this story. @property creator @type String @readonly
	this.creator = raw.attr('creator');
	
	// The version of Twine used to create this story. @property creatorVersion @type String @readOnly
	this.creatorVersion = raw.attr('creator-version');

	// initialize history and state
	//An array of passage IDs, one for each passage viewed during the current session. @property history @type Array @readOnly
	this.history = [];
	
	 //If set to true, then any JavaScript errors are ignored -- normally, play would end with a message shown to the user.  @property ignoreErrors @type Boolean
	this.ignoreErrors = false;

	// The message shown to users when there is an error and ignoreErrors is not true. Any %s in the message will be interpolated as the actual error messsage. @property errorMessage @type String
	this.errorMessage = '\u26a0 %s';

	//Find out if we're in sketchmode.
	this.sketchMode = (function() {
		var sketchRE = /sketch>>/;
		if ($("#page").text().match(sketchRE) !== null) {
			return true;
		}
		return false;
	})();
	//
	// An array of all passages, indexed by ID. @property passages @type Array. The passages are turned into objects.
	this.content = [];
	var c = this.content;
	raw.children('tw-passagedata').each(function (raw){
		var $t = $(this);
		var id = parseInt($t.attr('pid'));
		var tags = $t.attr('tags');
		c[id] = new Passage(id, $t.attr('name'), (tags !== '' && tags !== undefined) ? tags.split(' ') : [], $t.html());
	});
	// An array of user-specific scripts to run when the story is begun. @property userScripts @type Array
	this.userScripts = _.map(raw.children('*[type="text/twine-javascript"]'), function (raw){
		return $(raw).html();
	});
	// An array of user-specific style declarations to add when the story is begun. @property userStyles @type Array
	this.userStyles = _.map(raw.children('*[type="text/twine-css"]'), function (raw){
		return $(raw).html();
	});
};



_.extend(Story.prototype,
{
	/*
	 Begins playing this story.

	 @method start
	*/

	start: function()
	{
		//$('#page').html('Building your story');
		// set up history event handler

		$(window).on('popstate', function (event)
		{
			var state = event.originalEvent.state;
			this.show(this.startPassage, true);
		}.bind(this));

		// set up passage link handler

		$('body').on('click', 'a[data-passage]', function (e)
		{
			if (typeof window.BorFLastUsed == 'undefined') {
				window.BorFLastUsed = false;
			} else {
				if (window.BorFLastUsed === true) {
					if ( _.lastIndexOf(window.story.history) != window.historyIndex) { 
						window.story.history = window.story.history.slice(0,window.historyIndex);
					}
				}
			}
			window.BorFLastUsed = false; //Allow the history to continue.
			this.show(_.unescape($(e.target).attr('data-passage')));
		}.bind(this));

		// set up error handler

		window.onerror = function (message, url, line)
		{
			if (! this.errorMessage || typeof(this.errorMessage) != 'string')
				this.errorMessage = Story.prototype.errorMessage;

			if (! this.ignoreErrors)
			{
				if (url)
				{
					message += ' (' + url;

					if (line)
						message += ': ' + line;

					message += ')';
				};
				if (window.bypassError === false) {
					$('#page').html(this.errorMessage.replace('%s', message));
				}	
			};
		}.bind(this);

		//Set up the hotkeys
		$(document).keydown(function(e) {
			switch(e.which) {
				case 37: // left
					if (e.ctrlKey) {
						bfFunc("back");
					} else {
						window.scrollBy(-20,0);
					}
					break;
	
				case 38: // up
					if (e.ctrlKey){
						quickLoadFunc();
					} else {
						window.scrollBy(0,-20);
					}
					break;

				case 39: // right
					if (e.ctrlKey) {
						bfFunc("forward");
					} else {
						window.scrollBy(20,0);
					}

					break;
	
				case 40: // down
					if (e.ctrlKey) {
						quickSaveFunc();
					} else {
						window.scrollBy(0,20);
					}
					break;
				case 79: // CTRL + ALT + O
					if (e.altKey && e.ctrlKey) {
						pdfFunc(false);
					}
					break;
				case 80: // CTRL + ALT +P
					if (e.altKey && e.ctrlKey) {
						pdfFunc(true);
					}
					break;
	
				default: return; // exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move caret). If we want default action, we need to code it in.
		});





		// activate user styles

		_.each(this.userStyles, function (style)
		{
			$('body').append('<style>' + style + '</style>');
		});

		// run user scripts

		_.each(this.userScripts, function (script)
		{
			eval(script);
		});

		/*
		 Triggered when the story is finished loading, and right before the first passage is displayed. The story property of this event contains the story.@event startstory
		*/

		$.event.trigger('startstory', { story: this });
		this.show(this.startPassage);
	
	},

	/*
	 Returns the Passage object corresponding to either an ID or name. If none exists, then it returns null. @method passage @param idOrName {String or Number} ID or name of the passage @return Passage object or null
	*/

	passage: function (idOrName)
	{
		if (_.isNumber(idOrName))
			return this.content[idOrName];
		else if (_.isString(idOrName))
			return _.findWhere(this.content, { name: idOrName });
	},

	/*
	 Displays a passage on the page, replacing the current one. If there is no passage by the name or ID passed, an exception is raised. Calling this immediately inside a passage (i.e. in its source code) will not display the other passage. Use Story.render() instead. @method show @param idOrName {String or Number} ID or name of the passage @param noHistory {Boolean} if true, then this will not be recorded in the story history
	*/

	show: function (idOrName, noHistory)
	{
		var passage = this.passage(idOrName);

		if (! passage)
			throw new Error('There is no passage with the ID or name "' + idOrName + '"');

		/*
		 Triggered whenever a passage is about to be replaced onscreen with another. The passage being hidden is stored in the passage property of the event. @event hidepassage
		*/

		$.event.trigger('hidepassage', { passage: window.passage });

		//A fun little scroll to the top of the page, for the next passage.
		$('html, body').animate({ scrollTop: 0 }, 'fast');
		/*
		 Triggered whenever a passage is about to be shown onscreen. The passage being displayed is stored in the passage property of the event. @event showpassage
		*/

		$.event.trigger('showpassage', { passage: window.passage });

		if (typeof window.BorFLastUsed == 'undefined' || window.BorFLastUsed === false) {
			this.history.push(passage.id);
		}
		window.passage = passage;

		$('#page').html(passage.screenRender()); //showing event. Displays the unescaped text from the browser section of the passage.

		/*
		 Triggered after a passage has been shown onscreen, and is now displayed in the div with id passage. The passage being displayed is stored in the passage property of the event. @event showpassage:after
		*/

		$.event.trigger('showpassage:after', { passage: passage });
	},

	/*
	 Returns the HTML source for a passage. This is most often used when embedding one passage inside another. In this instance, make sure to use <%= %> instead of <%- %> to avoid incorrectly encoding HTML entities. @method render @param idOrName {String or Number} ID or name of the passage @return {String} HTML source code
	*/
	render: function (idOrName)
	{
		var passage = this.passage(idOrName);

		if (! passage)
			throw new Error('There is no passage with the ID or name \"' + idOrName + "\"");

		return passage.screenRender();
	}
});
