/**
 * Libraries.include(path) -- path must be relative to adobe_scripts/lib/
 * See: https://gist.github.com/jasonrhodes/5286526
 */
[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});
var Libraries=function(a){return{include:function(b){return b.match(/\.jsx$/i)||(b+=".jsx"),$.evalFile(a+b)}}}($.fileName.split("/").splice(0,$.fileName.split("/").indexOf("adobe_scripts")+1).join("/") + "/lib/");


/**
 * Adobe JS Polyfills 
 * 
 * Could be moved to a separate file if we could figure
 * out how to include other script files
 */
Libraries.include("adobe-polyfills");


/**
 * Underscore.js (the whole thing!)
 */
Libraries.include("underscore");



(function (app) {

    var doc = app.activeDocument;
    var fileName = doc.name.split('.')[0]; // removes the extension from a file name
    var filePath = doc.path;
    // var currentFolder = filePath.split(fileName)[0];


    // var directory = new Folder(doc.path.fsName + "/exports");

    var jpg = new File(filePath + fileName + "-super.jpg");
    // jpg.changePath("first-test.jpg");

    var options = _.extend(new ExportOptionsSaveForWeb(), {
		quality: 0,
		format: SaveDocumentType.JPEG,
	});

    // doc.exportDocument(jpg, ExportType.SAVEFORWEB, options);
    
    // doc.close(SaveOptions.DONOTSAVECHANGES);
    
    alert(fileName);
    alert(filePath);

})(app);







