/**
 * Libraries.include(path) -- path must be relative to adobe_scripts/lib/
 * See: https://gist.github.com/jasonrhodes/5286526
 */
[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});
var Libraries=function(a){return{include:function(b){return b.match(/\.jsx$/i)||(b+=".jsx"),$.evalFile(a+b)}}}($.fileName.split("/").splice(0,$.fileName.split("/").indexOf("adobe_scripts")+1).join("/") + "/lib/");


/*
* Name: "JHU-Logo-Exporter.jsx
*
* Description: An Adobe Illustrator CS6 script to auto export files
* first by artboard and then by name-matched layer.
*
*/


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


/**
 * Custom Exporter object (where we put
 * all of our custom export methods)
 */
Libraries.include("Exporter");


(function (app) {

    var doc = app.activeDocument;
    var count = 0;
    var timer = {};
    var i;
    var j;
    var currentArtboard;
    var currentLayer;
    var attributes;
    var artboard;
    var layer;
    var fpath;

    var filter = prompt("Filter by division?\nLeave blank to export all.").toLowerCase().trim();
    if (typeof filter === "string" && filter === "undefined") {
        filter = undefined;
    }

    timer.start = (new Date).getTime();

    Exporter.init(doc, { packDirectory: "../All Packs" });

    // Loop through each artboard
    _.each(doc.artboards, function (a, i) {

        attributes = a.name.split(":").map(Exporter.processAttributes);

        artboard = {
            object: a,
            index: i,
            number: i + 1,
            name: a.name,
            rect: a.artboardRect,
            division: attributes[0],
            sizeFormat: attributes[1],
            color: attributes[2]
        };

        artboard.fileName = [artboard.division, "shield", artboard.sizeFormat, artboard.color].join(".");

        if (filter && artboard.division !== filter) {
            return;
        }

        //adjust artboard position
        //Note: Adobe script uses proper y-coordinate values (moving up is positive, moving down is negative).
        //      This is different from the way the interface deals with y-coordinate values, where moving
        //      down is associated with increasing the y-coordinate value.
        //      This is unnecessarily stupid.
        a.artboardRect = artboard.rect.map(function (coordinate, i) {
            if (i == 0 || i == 3) {
                return Math.floor(coordinate) - 1;
            } else {
                return Math.ceil(coordinate) + 1;
            }
        });


        Exporter.packSetup(artboard.division, "shield");
        doc.artboards.setActiveArtboardIndex(artboard.index);

        fpath = Exporter.resetAllPacksPath([artboard.division, "shield", artboard.sizeFormat]);

        Exporter.savePNG(fpath, artboard.fileName);
        if (artboard.color !== "white") { Exporter.saveJPG(fpath, artboard.fileName); }
        Exporter.savePDF(fpath, artboard.number, artboard.fileName);
        Exporter.saveEPS(fpath, artboard.number, artboard.fileName);
        Exporter.saveSVG(fpath, artboard.fileName);

        // Increment the counter in a superhackalicious way
        if (artboard.color === "white") {
            count += artboard.sizeFormat === "small" ? 3 : 2;
        } else {
            count += artboard.sizeFormat === "small" ? 4 : 2;
        }

    });

    timer.end = (new Date).getTime();
    timer.duration = timer.end - timer.start;

    alert("Congratulations! You created " + count + " shield files in " + (timer.duration / 1000 / 60) + " minutes!");

    doc.close(SaveOptions.DONOTSAVECHANGES);

})(app);
