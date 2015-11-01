# Screentastic
A Twine 2 Story Format for creating Interactive Screenplays.

Howdy!

Here's the basic how-to for using Screentastic

## Installation

-Open Twine 2.
-On the right side, you'll see +story, Import from File, Archive, and Formats. Click on Formats.
-There will be the popup window that shows you all of your currently installed formats. At the top, on the third tab is "Add a New Format". Click that.
-Copy-paste either the folder, or the URL into the box and click "+Add"
-Here's where it gets a little funky. Twine doesn't really know when a Story Format's been added, so just wait for 5-10 seconds and it should be completely loaded.
-X out of the format popup and click on "Formats" again.
-Click on the "Story Formats" tab and Screentastic will show up underneath Sugarcube. There's no icon at this point so it just shows a broken image.

And that's it! Screentastic is installed in Twine and whenever there is an update, simply overwrite that format.js file and Twine will automatically use the updated format file.

## Usage

Using Twine is pretty simple. There's two main modes: Production mode and Sketch mode.

In Production mode, Screentastic acts just like a regular screenplay, with links added. It uses its own special kid of markup that looks like so:
#### itm>> content
Itm is the kind of object you need displayed at that point. It could be a character name, some dialogue, a parenthetical... anything.
content is the actual content of the code block.
So for instance, if I have this snippet:
```
cha>>Dan the man
dia>>I'm the fucken man!
```
It will show up as if you wrote it with Final Draft, Celtx, or any other screenwriting software.

Sketch mode, on the other hand is a great place for outlining your ideas. simply make the first line of the first passage "sketch>>" or type "window.sketchMode = true" into the story javascript, and Screentastic will turn every single line of the story into an unordered list item.

I personally use Sketch mode to write down my story beats, then turn them into screenplay format in another story.
