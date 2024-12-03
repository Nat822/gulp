import gulp from 'gulp';
//html
import fileInclude from 'gulp-file-include';
import htmlclean from 'gulp-htmlclean';
import webpHtml from 'gulp-webp-html';

//sass
import * as dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import gulpSass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import csso from 'gulp-csso';
import webpCss from 'gulp-webp-css';

import server from 'gulp-server-livereload';
import clean from 'gulp-clean';
import fs from 'fs';
import sourceMaps from 'gulp-sourcemaps';
import groupMedia from 'gulp-group-css-media-queries';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import autoPrefixer from 'gulp-autoprefixer';


//images
import imagemin from 'gulp-imagemin';
import changed from 'gulp-changed';
import webp from 'gulp-webp';



const plumberNotify = (title) => {
   return {
      errorHandler: notify.onError({
         title: title,
         message: 'Error <%= error.message %>',
         sound: false,
      }),
   };
}

const sass = gulpSass(dartSass);

const config = {
   mode: 'production',
   entry: {
      index: './src/js/index.js',
      //contacts: './src/js/contacts.js',
      //about: './src/js/about.js'
   },
   output: {
      filename: '[name].bundle.js',
   },
   module: {
      rules: [
         {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
         },
      ],
   },
}

gulp.task('js:docs', function () {
   return gulp.src('./src/js/*.js')
      .pipe(changed('./docs/js/'))
      .pipe(plumber(plumberNotify('JS')))
      .pipe(babel())
      .pipe(webpack(config))
      .pipe(gulp.dest('./docs/js/'))
})



gulp.task('html:docs', function () {
   return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
      .pipe(changed('./docs/'))
      .pipe(plumber(plumberNotify('HTML')))
      .pipe(fileInclude({
         prefix: '@@',
         basepath: '@file',
      }))
      .pipe(webpHtml())
      .pipe(htmlclean())
      .pipe(gulp.dest('./docs/'))
})

gulp.task('sass:docs', function () {
   return gulp.src('./src/scss/*.scss')
     
      .pipe(changed('./docs/css/'))
      .pipe(plumber(plumberNotify('Sass')))
      .pipe(sourceMaps.init())
      .pipe(autoprefixer())
      .pipe(sassGlob())
      .pipe(webpCss())
      .pipe(groupMedia())
      .pipe(sass())
      .pipe(csso())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest('./docs/css/'))
})

gulp.task('images:docs', function () {
   return gulp.src('./src/images/**/*', { encoding: false })
      .pipe(changed('./docs/img/'))
      .pipe(webp())
      .pipe(gulp.dest('./docs/img/'))
      .pipe(gulp.src('./src/images/**/*'), { encoding: false })
      .pipe(changed('./docs/img/'))
      .pipe(imagemin({ verbose: true }))
      .pipe(gulp.dest('./docs/img/'))
})

gulp.task('fonts:docs', function () {
   return gulp.src('./src/fonts/**/*')
      .pipe(changed('./docs/fonts/'))
      .pipe(gulp.dest('./docs/fonts/'))
})

gulp.task('files:docs', function () {
   return gulp.src('./src/files/**/*')
      .pipe(changed('./docs/files/'))
      .pipe(gulp.dest('./docs/files/'))
})

gulp.task('server:docs', function () {
   return gulp.src('./docs/')
      .pipe(server({
         livereload: true,
         open: true
      }))
})

gulp.task('clean:docs', function (done) {
   if (fs.existsSync('./docs/')) {
      return gulp.src('./docs/', { read: false })
         .pipe(clean())
   }
   done();
})



gulp.task('default', gulp.series(
   'clean:docs',
   gulp.parallel('html:docs', 'sass:docs', 'images:docs', 'fonts:docs', 'files:docs', 'js:docs'),
   gulp.parallel('server:docs')))