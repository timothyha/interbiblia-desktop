var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var utf8 = require('utf8');

/**

https://github.com/rogerwang/node-webkit/wiki/Window-menu

The resulted menu will have indeed three submenus: your-app-name, Edit and Window, which are necessary for full-functionality apps.

Another thing you may encounter is that the first item of application menu shows node-webkit instead of your-app-name, to fix it, you need to edit CFBundleName in node-webkit.app/Contents/Info.plist. Set your app name instead of node-webkit string.

**/
var nw = require('nw.gui');
var win = nw.Window.get();
var nativeMenuBar = new nw.Menu({ type: "menubar" });
nativeMenuBar.createMacBuiltin("Playground", {
  hideEdit: true,
  hideWindow: true
});
win.menu = nativeMenuBar;

function encode_utf8(s) { return unescape(encodeURIComponent(s)); }
function decode_utf8(s) { return decodeURIComponent(escape(s)); }

/**

Module is either a folder with descriptive bibleqt.ini (old style), or an .sqlite file, or .epub or anything we may support in the future.

**/
function Module(path, name) {

	this.path = path;
	this.name = name;

	this.searchText = function(txt, callback) {

		var db = new sqlite3.Database(this.path);
		var result = "";
		var word = '%' + txt + '%';

		db.all("select book, chapter, verse, txt from contents where txt like ? order by serial",
			word, 
			function(err, rows) {
				result = "";
				rows.forEach( function(row) {
					result = result + row.book + '-' + row.chapter + '-' + row.verse + ': '  + row.txt + '<br/>';
					}
				);
				if(typeof callback == 'function')
					callback(result);
			}
		);
		db.close();
	}
}

/**

After document is loaded (and displayed), we will start scanning the folder with modules and display their names.  Meanwhile a collection of module objects will be created for future search operations.

**/
$(document).ready(
	function() {

	var module = new Module('/Users/timothyha/Projects/interbiblia_modules/russian.sqlite', 'RstStrong'); 

	$("#maintext").html('Ay up me duck!  Welcome to the playground.');

	$("#searchbutton").click(
		function() {
			var word = ($("#searchbox").val());
			module.searchText(word, function(result) {
				$("#maintext").html(result);
			});
		});
	}
);

/**

when db file is not present we are having errors with db and rows

timothyha@iMac-2:~/Dropbox/Node.js/Projects/interbiblia-desktop/playground$nw .
2014-11-23 08:31:55.817 node-webkit[22281:1017784] Internals of CFAllocator not known; out-of-memory failures via CFAllocator will not result in termination. http://crbug.com/45650
[22281:1123/083155:ERROR:breakpad_mac.mm(238)] Breakpad initializaiton failed
2014-11-23 08:31:56.198 node-webkit Helper[22282:1017841] Internals of CFAllocator not known; out-of-memory failures via CFAllocator will not result in termination. http://crbug.com/45650
2014-11-23 08:31:56.533 node-webkit Helper[22283:1017875] Internals of CFAllocator not known; out-of-memory failures via CFAllocator will not result in termination. http://crbug.com/45650
[22281:1123/083157:INFO:CONSOLE(1)] ""process.mainModule.filename: /Users/timothyha/Dropbox/Node.js/Projects/interbiblia-desktop/playground/index.html"", source: process_main (1)
[22281:1123/083203:INFO:CONSOLE(28)] "Uncaught TypeError: Cannot read property 'forEach' of undefined", source: /Users/timothyha/Projects/Node.js/node_modules/sqlite3/lib/trace.js (28)
timothyha@iMac-2:~/Dropbox/Node.js/Projects/interbiblia-desktop/playground$nw .

**/
