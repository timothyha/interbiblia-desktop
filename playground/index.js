var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var utf8 = require('utf8');

/**

https://github.com/rogerwang/node-webkit/wiki/Window-menu

TODO:
"... Another thing you may encounter is that the first item of application menu shows node-webkit instead of your-app-name, to fix it, you need to edit CFBundleName in node-webkit.app/Contents/Info.plist. Set your app name instead of node-webkit string.""

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

Reference is a link pointing to a text range inside a Module.
OSIS links are for correspondence between different Bible texts (see OSIS standard).

**/

function Reference() {
	this.moduleName = '';
	this.book1 = 0;
	this.chapter1 = 0;
	this.book2 = 0;
	this.chapter2 = 0;
	this.verse1 = 0;
	this.verse2 = 0;
	this.osis = '';
	this.content = '';
}

/**

Module is either a folder with descriptive bibleqt.ini (old style), or an .sqlite file, or .epub or anything we may support in the future.

**/

function Module(path, name) {

	this.path = path;
	this.name = name;
	this.books = new Array();
	this.chapterQtys = new Array();

	this.getBookChapter = function(book, chapter, callback) {

		var db = new sqlite3.Database(this.path);

	  	db.all("SELECT book, chapter, verse, txt FROM contents where book=" + book + " and chapter=" + chapter + " order by verse", 
		  	function(err, rows) {
				var results = new Array();
		  		rows.forEach (
		  		function(row) {
					var ref = new Reference();
		   			ref.moduleName = this.name;
			   		ref.book1 = row.book;
		   			ref.book2 = row.book;
		   			ref.chapter1 = row.chapter;
		   			ref.chapter2 = row.chapter;  
		   			ref.verse1 = row.verse;
		   			ref.verse2 = row.verse;
		   			ref.content = row.txt;	  	
		  			//console.log('REF = ' + ref.verse1);

		   			results.push(ref);	
		   		});
				if(typeof callback == 'function')
					callback(results);
			});		
	  	db.close();
	}

	this.searchText = function(txt, callback) {

		// check db file existence first
		if(!fs.existsSync(this.path)) {
			if(typeof callback == 'function')
				callback('ERROR_NOTFOUND: ' + this.path); // TODO: raise error?
			return;
		};

		var db = new sqlite3.Database(this.path);

		var result = "";
		var queryparts = new Array();
		var doublewords = new Array();

		var words = txt.trim().replace(/\s+/g, " ").split(" "); // remove all duplicated spaces

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
					result = result + row.book + '-' + row.chapter + '-' + row.verse + ': '  
									+ row.txt + '<br/>';
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

	$("#testlink").click(
		function() {
			module.getBookChapter(1,1, function(refs) {
				var txt = "";
				refs.forEach(
					function(ref){
						txt = txt + ref.book1 + '-' + ref.chapter1 + '-' + ref.verse1 + ': ' 
							+ ref.content + '<br/>';
					});
				$("#maintext").html(txt);
			}); 
		});

	} // end of document .ready
);
