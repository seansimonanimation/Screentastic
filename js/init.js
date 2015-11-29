'use strict';



$(document).ready(function() {
	window.bypassError = false; //one of the callbacks in pdfmake activates Screentastic's built-in error handler and destroys #page's content.
	pdfMake.fonts = {CourierPrime: { normal: 'CourierPrime.ttf' }};
	window.story = new Story($('tw-storydata'));
	$.each(window.story.content, function(pasid, pasobj){
		if (pasobj !== undefined) {
			pasobj.parsePassage(); //uses the pdfmake library's built-in functions to auto-parse for lines and pages for us. It's beautiful!
		}
	});
	window.story.start();
});


