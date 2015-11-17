/*This is the Javscript file that holds all the goodies regarding the menu!
Things that are in the menu:
The menu activator!
The QuickSave button (there's only one)
The QuickLoad button (load the only quicksave)
The Save to PDF button
The Print button.
*/
'use strict';

function menuButtonFunc() {

	var menuButtonEl = document.getElementById("menuButton");
	var menuBarEl = document.getElementById("menuBar");
	//var pageEl = document.getElementbyId("page"); //moving the page is broken atm...
	//var pageClass = pageEl.className; //For now, the menu must just cover the screen...
	if (menuButtonEl.className == "menuHereButton") {
		menuButtonEl.className = "menuAwayButton";
		menuBarEl.className = "menuGone";
		//pageEl.className = "pageDefaultPos";

	} else {
		menuButtonEl.className = "menuHereButton";
		menuBarEl.className = "menuHere";
		//pageEl.className = "pageMenuPos";
	}

}

function pdfFunc(print) {
	
	window.bypassError = true;
	if (print === true) {
		//alert("Sorry, Printing isn't implemented yet... :(");
		makePDF(true);
	} else {
		makePDF(false);
	}

}

function quickSaveFunc() {
	window.save = {pid : window.passage.id, his : window.story.history};
	if (typeof window.historyIndex != 'undefined') {
		window.save.BaFoPl = window.historyIndex;
	} else {
		window.save.BaFoPl = 'none';
	}
	if (typeof window.BorFLastUsed != 'undefined') {
		window.save.lnkOrCtrl = window.BorFLastUsed;
	} else {
		window.save.lnkOrCtrl = 'none';
	}
	console.log("Quicksaved!");
}

function quickLoadFunc() {
	if (typeof window.save != 'undefined') {
		window.story.history = window.save.his;
		//Back or forward used... history index first, then the Back or Forward used bool.
		if (window.save.BaFoPl === 'none') {
			delete window.historyIndex;
		} else {
			window.historyindex = window.save.BaFoPl;
		}
		if (window.save.lnkOrCtrl == 'none') {
			delete window.BorFLastUsed;
		} else {
			window.BorFLastUsed = window.save.lnkOrCtrl;
		}
		try {
			window.story.show(window.save.pid); //load the quicksaved passage.
			console.log("Quickload successful!");
		} catch(e) {
			alert(e);
		}
	} else {
		console.log("No quicksave exists.");
		//swallow the error... like a bitch.
	}
}

function bfFunc(direction) {
	if (typeof window.historyIndex == 'undefined') {
		window.historyIndex = _.findLastIndex(window.story.history);
	}

	if (direction == "back" && window.historyIndex === 0) {
		console.log("You cannot go " + direction + ".");
		return;	
	} else if (direction == "forward" && window.historyIndex == _.findLastIndex(window.story.history)) {
		console.log("You cannot go " + direction + ".");
		return;	
	}

	if (direction == "back") {
		window.historyIndex--;
	} else {
		window.historyIndex++;
	}
	window.BorFLastUsed = true;
	window.story.show(window.story.history[window.historyIndex]);
	//console.log([direction,window.historyIndex, _.findLastIndex(window.story.history)]); //uncomment this when testing this stuff :)
}
