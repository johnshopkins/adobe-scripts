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
    
})();

var doc = app.activeDocument;

// var savePath = Folder.selectDialog("Choose the folder where these packs will be saved.");
var absPath = doc.path.fsName;

var allPacks = doc.path.insert("All Packs");

var packSetup = (function (parent) {
	
	return function (name) {
		var pack = parent.insert(name);
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
	};

})(allPacks);

var resetAllPacksPath = function (division, sizeFormat) {
	var path = new Folder(absPath);
	// alert(path.fsName);
	path.changePath('All Packs/' + division + '/' + sizeFormat + '/');
	// confirm(path.fsName);
	return path;
};

var scalingFactor = 500;

function savePNG(file, filename) {
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
}

function saveJPG(file, filename) {
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
}

function savePDF( file, artboardNumber, filename ) {
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
}

function saveEPS( file, artboardNumber, filename ) {
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
}

function hideLayers(layers)
{
	_.each(layers, function(layer) {  
		layer.visible = false;
	});
}


var processAttributes = function (item) {
	return item.toLowerCase().trim().replace(" ", "-");
};

// alert(doc.artboards);

// go through each artboard
(function () {
	for(var i=0; i<doc.artboards.length; i++) {
		
		var currentArtboard = doc.artboards[i];
		var artboardAttributes = currentArtboard.name.split(":").map(processAttributes);

		var artboard = {
			name: currentArtboard.name,
			division: artboardAttributes[0],
			sizeFormat: artboardAttributes[1],
			orientation: artboardAttributes[2]
		};

		// confirm("This is artboard index " + i + ", called " + artboard.name);

		// if (!confirm(artboard.division)) { exit(); }

		packSetup(artboard.division);
		doc.artboards.setActiveArtboardIndex(i);

		// go through each layer
		for(var j=0; j<doc.layers.length; j++) {
			var currentLayer = doc.layers[j];
			var layerAttributes = currentLayer.name.split(".").map(processAttributes);

			// alert("new layer");
			// alert(artboardAttributes);
			// alert(layerAttributes);

			// confirm("Continue?");

			var layer = {
				name: currentLayer.name,
				division: layerAttributes[0],
				sizeFormat: layerAttributes[1],
				orientation: layerAttributes[2],
				color: layerAttributes[3]
			};
			var fpath;

			if( artboard.division === layer.division && artboard.sizeFormat === layer.sizeFormat && artboard.orientation === layer.orientation) {

				hideLayers(doc.layers);
				currentLayer.visible = true;

				fpath = resetAllPacksPath(artboard.division, layer.sizeFormat);
				savePNG(fpath, layer.name);

				// alert('Saving ' + layer.name + '.png to ' + fpath.fsName);

				fpath = resetAllPacksPath(artboard.division, layer.sizeFormat);
				saveJPG(fpath, layer.name);

				// alert('Saving ' + layer.name + '.jpg to ' + fpath.fsName);

				fpath = resetAllPacksPath(artboard.division, layer.sizeFormat);
				savePDF(fpath, i + 1, layer.name);

				// alert('Saving ' + layer.name + '.pdf to ' + fpath.fsName);

				fpath = resetAllPacksPath(artboard.division, layer.sizeFormat);
				saveEPS(fpath, i + 1, layer.name);
			}
		}
	}
})();
