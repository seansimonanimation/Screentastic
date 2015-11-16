'use strict';

$(document).ready(function()
{
	//$("#page").html("Please wait... Building your script.");				
	window.bypassError = false; //one of the callbacks in pdfmake activates Screentastic's built-in error handler and destroys #page's content.
	window.storyData = $('tw-storydata');
	window.story = new Story($('tw-storydata'));
	window.sketchMode = false; //Screentastic stories are production mode by default.  
	window.story.start();

});
