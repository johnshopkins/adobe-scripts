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
    var i;
    var j;
    var currentArtboard;
    var currentLayer;
    var attributes;
    var artboard;
    var layer;
    var fpath;

    Exporter.init(doc, {
        scalingFactor: 500
    });

    // Loop through each artboard
    for(i = 0; i < doc.artboards.length; i++) {

        currentArtboard = doc.artboards[i];
        attributes = currentArtboard.name.split(":").map(Exporter.processAttributes);

        artboard = {
            index: i,
            number: i + 1,
            name: currentArtboard.name,
            division: attributes[0],
            sizeFormat: attributes[1],
            orientation: attributes[2]
        };

        Exporter.packSetup(artboard.division);
        doc.artboards.setActiveArtboardIndex(artboard.index);
        
        // Convert all TextFrame objects in the document to outlines
        while (doc.textFrames.length > 0) {
            doc.textFrames[0].createOutline();
        }
        // Note: createOutline() changes the object and affects the number
        // of TextFrame objects left, so _.each() failed half way through
        // each time, so this works better and faster.

        // Loop through each layer
        for(j = 0; j < doc.layers.length; j++) {

            currentLayer = doc.layers[j];
            attributes = currentLayer.name.split(".").map(Exporter.processAttributes);

            layer = {
                index: j,
                name: currentLayer.name,
                division: attributes[0],
                sizeFormat: attributes[1],
                orientation: attributes[2],
                color: attributes[3]
            };

            if (Exporter.artboardLayerMatch(artboard, layer)) {

                Exporter.hideLayers(doc.layers);
                currentLayer.visible = true;

                fpath = Exporter.resetAllPacksPath([artboard.division, layer.sizeFormat]);

                Exporter.savePNG(fpath, layer.name);
                if (layer.color !== "white"){Exporter.saveJPG(fpath, layer.name);};
                Exporter.savePDF(fpath, artboard.number, layer.name);
                Exporter.saveEPS(fpath, artboard.number, layer.name);
            }
        }
    }

    doc.close();

})(app);


