'use strict';
/*
$(window).load(function(){
	//console.log($('tw-storydata'));
	window.storyData = $('tw-storydata');
	$('#page').html('<p id=\"dialog\">Building your story</p>');
	//console.log(window.storyData);
});
*/


$(document).ready(function()
{

	pdfMake.fonts = {CourierPrime: { normal: 'CourierPrime.ttf' }};
	window.bypassError = false; //one of the callbacks in pdfmake activates Screentastic's built-in error handler and destroys #page's content.
	window.story = new Story($('tw-storydata'));
	//Format all the things!
	//$('#page').html("<center><h1>Please wait while Screentastic builds your screenplay.</h1></center>");
	$.each(window.story.content, function(id, passage){
		if (passage != undefined && id !== 0){
			console.log(passage);
			passage.render();
			
		}
	});
	window.story.start();

});
