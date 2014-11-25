var interbiblia = require('interbiblia');
var fs = require('fs');

/**

https://github.com/rogerwang/node-webkit/wiki/Window-menu

TODO:
"... Another thing you may encounter is that the first item of application menu shows node-webkit instead of your-app-name, to fix it, you need to edit CFBundleName in node-webkit.app/Contents/Info.plist. Set your app name instead of node-webkit string.""

**/

var nw = require('nw.gui');
var win = nw.Window.get();
var nativeMenuBar = new nw.Menu({ type: "menubar" });
if(/^darwin/.test(process.platform))
	nativeMenuBar.createMacBuiltin("Playground", { hideEdit: true, hideWindow: true });
win.menu = nativeMenuBar;


/**

After document is loaded (and displayed), we will start scanning the folder with modules and display their names.  Meanwhile a collection of module objects will be created for future search operations.

**/
$(document).ready(
	function() {

	var module = new interbiblia.Module('/Users/timothyha/Projects/interbiblia_modules/russian.sqlite', 'RstStrong'); 

	$("#maintext").html('Ay up me duck!  Welcome to the playground.');

	// when to search? 
	// when Enter key is pressed or when there are more than two words on the line
	$("#searchbox").keypress( function(e){ 
		var txt = ($("#searchbox").val());
		if((e.which==13) || (txt.trim().replace(/\s+/g, " ").split(" ").length > 1)) {
			module.searchText(txt, function(result) {
				$("#maintext").html(result);
				});
		}
	});

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
