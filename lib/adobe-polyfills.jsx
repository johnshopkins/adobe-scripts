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
        newList.push(callback(this[i], i, this));
    }
    return newList;
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};