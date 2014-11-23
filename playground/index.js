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

/**

Module is either a folder with descriptive bibleqt.ini (old style), or an .sqlite file, or .epub or anything we may support in the future.

**/
function Module(path, name) {

	this.path = path;
	this.name = name;

	this.searchText = function(txt, callback) {

		// check db file existence first
		if(!fs.existsSync(this.path)) {
			if(typeof callback == 'function')
				callback('ERROR_NOTFOUND: ' + this.path); // TODO: raise error?
			return;
		};

		var db = new sqlite3.Database(this.path);
		var result = "";
		var words = txt.trim().replace(/\s+/g, " ").split(" ");
		//console.log(words);

		var queryparts = new Array();
		var doublewords = new Array();

		for(i=0; i<words.length; i++) {
			queryparts[i] = '((txt like ?) or (txt like ?))';
			// JOHN -> John
			doublewords[i+i] = '%' + words[i].substr(0,1).toUpperCase() 
				+ words[i].substr(1).toLowerCase() + '%';
			// jOhN -> john
			doublewords[i+i+1] = '%' + words[i].toLowerCase() + '%';
		}

		db.all("select book, chapter, verse, txt from contents where " + queryparts.join(' and ') 
					+ " order by serial",
			doublewords, 
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

	$("#searchbox").keypress( function(e){ if(e.which==13) $("#searchbutton").click(); });

	} // end of document .ready
);
