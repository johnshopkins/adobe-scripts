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
        }
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
	// export SAVE-FOR-WEB options
	var options = new ExportOptionsPNG24();
	// var folder = new Folder(file.fsName);

	options.transparency = true;
	options.artBoardClipping = true;
	options.antiAliasing = true;
	options.matte = false;
	options.horizontalScale = scalingFactor;
	options.verticalScale = scalingFactor;

	// export as SAVE-FOR-WEB
	file.changePath('PNG/' + filename + '.png');
	doc.exportFile(file, ExportType.PNG24, options);

}

function saveJPG(file, filename) {
	// export SAVE-FOR-WEB options
	var JPGMatte = new RGBColor();
		JPGMatte.red = 255;
		JPGMatte.green = 255;
		JPGMatte.blue = 255;

	var options = new ExportOptionsJPEG();
	
	options.artBoardClipping = true;
	options.antiAliasing = true;
	options.matte = true;
	options.matteColor = JPGMatte;
	options.horizontalScale = scalingFactor;
	options.verticalScale = scalingFactor;
	options.qualitySetting = 100;

	// export as SAVE-FOR-WEB
	file.changePath('JPG/' + filename + '.jpg');
	doc.exportFile(file, ExportType.JPEG, options);

}

function savePDF( file, artboardNumber, filename ) {
	// save as PDF options
	var options = new PDFSaveOptions();

	options.compatibility = PDFCompatibility.ACROBAT6;
	options.generateThumbnails = false;
	options.preserveEditability = false;
	options.acrobatLayers = false;
	options.artboardRange = artboardNumber;
	options.colorDownsampling = 0;

	// save as PDF
	file.changePath('PDF/' + filename + '.pdf');
	doc.saveAs(file, options);
}

function saveEPS( file, artboardNumber, filename ) {
	// save as EPS options
	var options = new EPSSaveOptions();

	options.compatibility = Compatibility.ILLUSTRATOR16;
	options.artboardRange = artboardNumber;
	options.embedLinkedFiles = true;
	options.embedAllFonts = true;
	options.includeDocumentThumbnails = false;
	options.saveMultipleArtboards = false;

	// save as EPS
	file.changePath('EPS/' + filename + '.eps');
	doc.saveAs(file, options);
}

function hideLayers(layers)
{
	forEach(layers, function(layer) {  
		layer.visible = false;
	});
}

function forEach(collection, fn)
{
	var n = collection.length;
	for(var i=0; i<n; ++i)
	{
		fn(collection[i]);
	}
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
