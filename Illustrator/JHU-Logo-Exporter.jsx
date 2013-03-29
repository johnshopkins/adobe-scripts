/*
* Description: 
* 
* An Adobe Illustrator CS6 script to auto export files
* first by artboard and then by name-matched layer.
*
*/

/**
 * Adobe JS Polyfills 
 * 
 * Could be moved to a separate file if we could figure
 * out how to include other script files
 */
Folder.prototype.insert = function (name) {
    var folder = new Folder(this.fsName + "/" + name);
    folder.create();
    return folder;
};

Array.prototype.map = function (callback) {
    var newList = [];
    for (i=0; i<this.length; i++) {
        newList.push(callback(this[i]));
    }
    return newList;
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};


/**
 * Custom utility underscore object,
 * select methods pulled from underscore.js
 */
var _ = (function () {
    var breaker = {};

    return {
        each: function(obj, iterator, context) {
            if (obj == null) return;
            else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    // alert("i is " + i);
                    // alert(obj);
                    if (iterator.call(context, obj[i], i, obj) === breaker) return;
                }
            } else {
                for (var key in obj) {
                    if (_.has(obj, key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) return;
                    }
                }
            }
        },
        extend: function(obj) {
            this.each(Array.prototype.slice.call(arguments, 1), function(source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        }
    };
})();


/**
 * Custom Exporter object (where we put
 * all of our custom export methods)
 */

var Exporter = (function () {
    var doc;
    var absPath;
    var allPacks;
    
    // master options object
    var master = {
        packDirectory: "All Packs"
    };

    return {
        init: function (document, options) {
            doc = document;
            master = _.extend(master, options);
            absPath = doc.path.fsName + "/" + master.packDirectory;
            allPacks = new Folder(absPath);

            allPacks.create();
        },
        packSetup: function (name) {
            var pack = allPacks.insert(name);
            var small = pack.insert("small");
            var large = pack.insert("large");

            small.insert("EPS");
            small.insert("PDF");
            small.insert("JPG");
            small.insert("PNG");

            large.insert("EPS");
            large.insert("PDF");
            large.insert("JPG");
            large.insert("PNG");
        },
        resetAllPacksPath: function (directories) {
            var path = new Folder(absPath);
            path.changePath(directories.join("/") + "/");

            return path;
        },
        artboardLayerMatch: function (artboard, layer) {
            return artboard.division === layer.division &&
                   artboard.sizeFormat === layer.sizeFormat &&
                   artboard.orientation === layer.orientation;
        },
        hideLayers: function (layers) {
            _.each(layers, function (layer) {
                layer.visible = false;
            });
        },
        processAttributes: function (item) {
            return item.toLowerCase().trim().replace(" ", "-");
        },
        savePNG: function (file, filename) {
            var options = _.extend(new ExportOptionsPNG24(), {
                transparency: true,
                artBoardClipping: true,
                antiAliasing: true,
                matte: false,
                horizontalScale: master.scalingFactor,
                verticalScale: master.scalingFactor
            });
            var file = new Folder(file.fsName);

            file.changePath('PNG/' + filename + '.png');
            doc.exportFile(file, ExportType.PNG24, options);
        },
        saveJPG: function (file, filename) {
            var JPGMatte = _.extend(new RGBColor(), {
                red: 255,
                green: 255,
                blue: 255
            });
            var options = _.extend(new ExportOptionsJPEG(), {
                artBoardClipping: true,
                antiAliasing: true,
                matte: true,
                matteColor: JPGMatte,
                horizontalScale: master.scalingFactor,
                verticalScale: master.scalingFactor,
                qualitySetting: 100
            });
            var file = new Folder(file.fsName);

            file.changePath('JPG/' + filename + '.jpg');
            doc.exportFile(file, ExportType.JPEG, options);
        },
        savePDF: function (file, artboardNumber, filename) {
            var options = _.extend(new PDFSaveOptions(), {
                acrobatLayers: false,
                artboardRange: artboardNumber,
                colorDownsampling: 0,
                compatibility: PDFCompatibility.ACROBAT6,
                generateThumbnails: false,
                preserveEditability: false
            });
            var file = new Folder(file.fsName);

            // save as PDF
            file.changePath('PDF/' + filename + '.pdf');
            doc.saveAs(file, options);
        },
        saveEPS: function (file, artboardNumber, filename) {
            var options = _.extend(new EPSSaveOptions(), {
                artboardRange: artboardNumber,
                compatibility: Compatibility.ILLUSTRATOR16,
                embedLinkedFiles: true,
                embedAllFonts: true,
                includeDocumentThumbnails: false,
                saveMultipleArtboards: false
            });
            var file = new Folder(file.fsName);

            file.changePath('EPS/' + filename + '.eps');
            doc.saveAs(file, options);
        }}
    };

})();

var doc = app.activeDocument;

var scalingFactor = 500;

// go through each artboard
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
                Exporter.saveJPG(fpath, layer.name);
                Exporter.savePDF(fpath, artboard.number, layer.name);
                Exporter.saveEPS(fpath, artboard.number, layer.name);
            }
        }
    }

    doc.close();

})(app);
