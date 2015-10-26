'use strict';

$(document).ready(function()
{

	window.storyData = $('tw-storydata');
	window.story = new Story($('tw-storydata'));
	window.sketchMode = false; //Screentastic stories are production mode by default.  
	window.story.start();

});
