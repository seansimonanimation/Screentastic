'use strict';

$(document).ready(function()
{
	pdfMake.fonts = {CourierPrime: { normal: 'CourierPrime.ttf' }};
	window.bypassError = false; //one of the callbacks in pdfmake activates Screentastic's built-in error handler and destroys #page's content.
	window.story = new Story($('tw-storydata'));
	window.story.start();

});
