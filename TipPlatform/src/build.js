var ncp = require('ncp').ncp,
    fs = require('fs-extra'),
    rimraf = require('rimraf'),
    UglifyJS = require("uglify-js");

ncp.limit = 16;

var destination = 'build';
var copy = [
    "data",
    "lib",
    "manifest.json",
    "package.json"
];
//match anything that doesn't match electrum
var ncpOptions = {
    filter: /^((?!electrum).)*$/
    //filter: /(?:^((?!electrum).)*$)|(?:.+electrum\/browser\/.+)/
}

function copyFile(src){
    fs.createReadStream(src).pipe(fs.createWriteStream(destination + '/' + src));
};

function removeOld(callback){

    var cb = callback || function(){};

    rimraf(destination, function(){
        fs.mkdir(destination);
        console.log('`'+destination+'` emptied.');
        cb();
    });

}


function buildNew(callback){
    var cb = callback || function(){},
        copied = 0;

    copy.forEach(function (source, i) {
        var dest = "build/" + source;

        ncp(source, dest, ncpOptions, function (err) {
            if (err) {
                return console.error(err);
            }
            console.log('Copied `' + source + '` to `' + dest + '`.');

            copied++;
            if(copied === copy.length){
                cb();
            }
        });
    });
}

function copyElectrum(callback){
    var src = 'lib/electrum/browser',
        compiledPath = destination + '/' + src;

    console.log("Copying Electrum");

    fs.mkdirSync(destination + '/lib/electrum');
    fs.mkdirSync(compiledPath);
    copyFile(src + '/bitcore.js');
    copyFile(src + '/electrum.js');
    callback();
}

function minifyOneFile(src){
    var result = UglifyJS.minify(src);
    fs.writeFileSync(src, result.code);
}

function minifyDirectory(src){
    fs.readdir(src, function(err, files){
        files.forEach(function(file, index){
            console.log("Minifying: " + src + file);
            minifyOneFile(src + file);
        });
    });
}

function doMinify(){

    minifyDirectory(destination + '/lib/background/');
    minifyDirectory(destination + '/lib/content/sites/');
    //minifyDirectory(destination + '/lib/content/');
    minifyDirectory(destination + '/lib/interfaces/');
    minifyDirectory(destination + '/lib/popup/');

    minifyOneFile(destination + '/lib/content/tipInterface.js');

    minifyOneFile(destination + '/lib/messenger.js');
    minifyOneFile(destination + '/lib/initialize.js');
    minifyOneFile(destination + '/lib/main.js');
    minifyOneFile(destination + '/lib/helpers.js');
}

removeOld(function(){
    buildNew(function(){
        copyElectrum(function(){
            doMinify();
        });
    });
});

