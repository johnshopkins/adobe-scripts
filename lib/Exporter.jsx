/**
 * Custom Exporter object (where we put
 * all of our custom export methods)
 */

function unlockAllLayers(document) {
    _.each(document.layers, function (layer, i) {
        layer.locked = false;
    });
}

$.global.Exporter = (function () {
    var doc;
    var absPath;
    var allPacks;

    // master options object
    var master = {
        packDirectory: "All Packs",
        scalingFactor: 500
    };

    return {
        init: function (document, options) {
            doc = document;
            master = _.extend(master, options);
            absPath = doc.path.fsName + "/" + master.packDirectory;
            allPacks = new Folder(absPath);

            allPacks.create();
            unlockAllLayers(document);
        },
        packSetup: function (name, parent) {
            var pack = allPacks.insert(name);
            var parent = pack.insert(parent);
            var small = parent.insert("small");
            var large = parent.insert("large");

            small.insert("EPS");
            small.insert("PDF");
            small.insert("SVG");
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
            return item.toLowerCase().trim().replace(/\s+/g, "-");
        },
        savePNG: function (file, filename) {
            var directory = Folder(file.fsName + "/PNG");
            if (!directory.exists) { return false; }

            var options = _.extend(new ExportOptionsPNG24(), {
                transparency: true,
                artBoardClipping: true,
                antiAliasing: true,
                matte: false,
                horizontalScale: master.scalingFactor,
                verticalScale: master.scalingFactor
            });
            var png = new Folder(file.fsName);

            png.changePath('PNG/' + filename + '.png');
            doc.exportFile(png, ExportType.PNG24, options);
            return png.exists;
        },
        saveJPG: function (file, filename) {
            var directory = Folder(file.fsName + "/JPG");
            if (!directory.exists) { return false; }

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
            var jpg = new Folder(file.fsName);

            jpg.changePath('JPG/' + filename + '.jpg');
            doc.exportFile(jpg, ExportType.JPEG, options);
            return jpg.exists;
        },
          savePDF: function (file, artboardNumber, filename) {
            var directory = Folder(file.fsName + "/PDF");
            if (!directory.exists) { return false; }

            var options = _.extend(new PDFSaveOptions(), {
                acrobatLayers: false,
                artboardRange: artboardNumber,
                colorDownsampling: 0,
                compatibility: PDFCompatibility.ACROBAT6,
                generateThumbnails: false,
                preserveEditability: false
            });
            var pdf = new Folder(file.fsName);

            // save as PDF
            pdf.changePath('PDF/' + filename + '.pdf');
            doc.saveAs(pdf, options);
            return pdf.exists;
        },
        saveEPS: function (file, artboardNumber, filename) {
            var directory = Folder(file.fsName + "/EPS");
            if (!directory.exists) { return false; }

            var options = _.extend(new EPSSaveOptions(), {
                compatibility: Compatibility.ILLUSTRATOR10,
                embedLinkedFiles: true,
                embedAllFonts: true,
                includeDocumentThumbnails: false,
                saveMultipleArtboards: false
            });
            var eps = new Folder(file.fsName);
            // Open the previously created pdf
            var pdf = File(file.fsName + "/PDF/" + filename + ".pdf");

            if (!pdf.exists) {
                throw new Error(52, "The EPS file creation process requires that the corresponding PDF exists, and there was an error finding " + pdf);
            }

            var pdfDoc = app.open(pdf);

            eps.changePath('EPS/' + filename + '.eps');

            pdfDoc.saveAs(eps, options);
            pdfDoc.close();
            return eps.exists;
        },
        saveSVG: function (file, filename) {
            var directory = Folder(file.fsName + "/SVG");
            if (!directory.exists) { return false; }

            var options = _.extend(new ExportOptionsSVG(), {});
            var svg = new Folder(file.fsName);
            svg.changePath('SVG/' + filename + '.svg');
            // Open the previously created pdf
            var pdf = File(file.fsName + "/PDF/" + filename + ".pdf");

            if (!pdf.exists) {
                throw new Error(52, "The SVG file creation process requires that the corresponding PDF exists, and there was an error finding " + pdf);
            }

            var pdfDoc = app.open(pdf);

            pdfDoc.exportFile(svg, ExportType.SVG, options);
            pdfDoc.close();
            return svg.exists;
        }
    };

})();
