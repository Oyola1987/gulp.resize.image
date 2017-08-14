'use strict';

var gulp = require('gulp');
var globule = require('globule');
var imageResize = require('gulp-image-resize');
var _ = require('lodash');
var through = require('through2');
var prompt = require('gulp-prompt');

var resizeOpts = {},
    srcPath = '',
    destPath = '';

gulp.task('resize-config', function (done) {
    return gulp.src('*')
        .pipe(prompt.prompt({
            name: 'imagePath',
            message: 'Images path? allow glob'
        }, function (res) {
            srcPath = globule.find(res.imagePath);
            if (!srcPath.length) {
                throw new Error('Nothing to resize');
            }            
        }))
        .pipe(prompt.prompt({
            default: 'resized',
            name: 'dest',
            message: 'Images destination path?'
        }, function (res) {
            destPath = res.dest;
       
        }))
        .pipe(prompt.prompt({
            default: 'auto',
            name: 'width',
            message: 'width?'
        }, function (res) {
            if (res.width !== 'auto') {
                resizeOpts.width = parseInt(res.width, 10);
            }            
        }))
          .pipe(prompt.prompt({
              default: 'auto',
              name: 'height',
              message: 'height?'
          }, function (res) {
              if (res.height !== 'auto') {
                  resizeOpts.height = parseInt(res.height, 10);
              }
          }))
         .pipe(prompt.prompt({
             default: false,
             name: 'crop',
             message: 'crop images?'
         }, function (res) {
             if(res.crop === 'true' || res.crop === true){
                 resizeOpts.height = true;
             }
         }))
        .pipe(prompt.prompt({
            default: 1,
            name: 'quality',
            message: 'quality, between 0 and 1 inclusive?'
        }, function (res) {
            resizeOpts.quality = parseFloat(res.quality);
        }));
});

gulp.task('resize', ['resize-config'], function () {
    console.log('resize options ==>', srcPath.length, resizeOpts);
    return gulp.src(srcPath)
       .pipe(through.obj(function (chunk, enc, cb) {
           console.log('resizing... ', chunk.path)
           cb(null, chunk)
       }))
       .pipe(imageResize(_.extend({
           imageMagick: true,
           upscale: false
       }, resizeOpts)))
       .pipe(gulp.dest(destPath));
});
