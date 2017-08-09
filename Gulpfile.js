'use strict';

var SRC = 'F:/Projects/boda-dani-y-judith/src/globals/images/bodorrio/*.JPG';
var FILE_NAME = 'dani_y_judith.';

var gulp = require('gulp');
var fs = require('fs');
var globule = require('globule');
var imageResize = require('gulp-image-resize');
var _ = require('underscore');
var rename = require("gulp-rename");
var shell = require('gulp-shell')
var range = _.range(4085, 4445);
var sequenceShellTask = [];
var sizeOf = require('image-size');
var prompt = require('gulp-prompt');

var ensureWrite = function (filePath, content) {
    var slash = '/',
        folders = filePath.split(slash),
        path = folders.shift();

    _.each(folders, function (folder) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        path += slash + folder;
    });

    fs.writeFileSync(path, content);
};

var pad = function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var gulpTaskBuilder = function (destFolder, srcFolder, options) {
    _.each(range, function (numberFile) {
        var taskName = 'image-' + destFolder + '-' + numberFile;

        sequenceShellTask.push('gulp ' + taskName);

        gulp.task(taskName, function (cb) {
            gulp.src('src/globals/images/' + srcFolder + '/*' + pad(numberFile, 4) + '.jpg')
                 .pipe(imageResize(_.extend({
                     imageMagick: true,
                     upscale: false
                 }, options)))
             .pipe(gulp.dest('src/globals/images/' + destFolder))
             .on('end', function () {
                 cb();
             });
        });
    });
};

gulp.task('images-clone', function () {
    gulp.src(SRC)
    .pipe(rename(function (path) {
        console.log('Copying image ==>', path.basename);
        path.basename = path.basename.replace('DSC0', FILE_NAME);
        path.extname = path.extname.toLowerCase();
        return path;
    }))
    .pipe(gulp.dest('src/globals/images/print'));
});

gulpTaskBuilder('xlarge', 'print', {
    width: 1920
});

gulpTaskBuilder('large', 'xlarge', {
    width: 1400
});

gulpTaskBuilder('medium', 'large', {
    width: 700
});

gulpTaskBuilder('thumbs', 'medium', {
    width: 230,
    height: 200,
    quality: 0.8,
    crop: true
});

gulp.task('images-sizes', function (done) {
    var images = globule.find('src/globals/images/medium/*.jpg'),
        portrait = [],
        landScape = [];

    _.each(images, function (imgPath) {
        var dimensions = sizeOf(imgPath),
            fileNumber = parseInt(_.last(imgPath.split('/')).replace(FILE_NAME, '').replace('.jpg', ''), 10);

        if (dimensions.width > dimensions.height) {
            landScape.push(fileNumber);
        } else {
            portrait.push(fileNumber);
        }
    });

    var content = JSON.stringify({
        landScape: landScape,
        portrait: portrait
    });

    ensureWrite("./dist/build/sizes.json", content);

    done()
});

gulp.task('image-sequence', shell.task(sequenceShellTask));

gulp.task('resize', function () {
    return gulp.src('test.js')
        .pipe(prompt.prompt({
            type: 'input',
            name: 'first',
            message: 'First question?'
        }));
});