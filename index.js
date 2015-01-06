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
	nativeMenuBar.createMacBuiltin("InterBiblia Desktop", { hideEdit: true, hideWindow: true });
win.menu = nativeMenuBar;

var appInterBiblia = angular.module('interbiblia', []);
var module = interbiblia.ModuleFindClass('/Users/timothyha/Projects/interbiblia_modules/russian.sqlite'); 

appInterBiblia.controller('appBodyController', function($scope) {
	$scope.inputSearchPhrase = '';
	$scope.maintext = {content: ''};
	$scope.searchresults = {content: ''};

	$scope.$watch("inputSearchPhrase", function(newValue, oldValue) {
		var txt = newValue;

		if((txt.length > 4) || (txt.trim().replace(/\s+/g, " ").split(" ").length > 1)) {
			module.searchText(txt, function(err, result)
			{
				$scope.searchresults = {content: result};
			});
		}
	});
});

/**

$(document).ready(function()
{

	$("#testlink").click(function() 
	{
		module.getBookChapter(1,1, function(err, refs)
		{
			var txt = "";
			refs.forEach( function(ref)
			{
				txt = txt + ref.book1 + '-' + ref.chapter1 + '-' + ref.verse1 + ': ' 
					+ ref.content + '<br/>';
			});
			$("#maintext").html(txt);
		}); 
	});

}); // end of document .ready

After document is loaded (and displayed), we will start scanning the folder with modules and display their names.  Meanwhile a collection of module objects will be created for future search operations.

**/

