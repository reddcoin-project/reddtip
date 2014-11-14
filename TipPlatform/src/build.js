var ncp = require('ncp').ncp,
    fs = require('fs-extra'),
    rimraf = require('rimraf');

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

function copyElectrum(){
    var src = 'lib/electrum/browser',
        compiledPath = destination + '/' + src;

    console.log("Copying Electrum");

    fs.mkdir(destination + '/lib/electrum');
    fs.mkdir(compiledPath);
    copyFile(src + '/bitcore.js');
    copyFile(src + '/electrum.js');
}

removeOld(function(){
    buildNew(function(){
        copyElectrum();
    });
});

