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


function printFunc() {
	alert("Sorry, printing isn't implemented yet... :(");
}

function PDFFunc() {
	alert("Sorry, PDFs aren't implemented yet... :(");
}

function quickSaveFunc() {
	alert("Sorry, saving and loading aren't implemented yet... :(");
}

function quickLoadFunc() {
	alert("Sorry, saving and loading aren't implemented yet... :(");
}

function forwardFunc() {
	alert("Sorry, Forward movement through passages isn't implemented yet... :(");
}

function backFunc() {
	alert("Sorry, Backward movement through passages isn't implemented yet... :(");
}
