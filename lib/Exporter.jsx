/**
 * Custom Exporter object (where we put
 * all of our custom export methods)
 */

$.global.Exporter = (function () {
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
        }
    };

})();