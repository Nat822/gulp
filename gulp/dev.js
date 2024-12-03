import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import * as dartSass from 'sass';

import gulpSass from 'gulp-sass';
import server from 'gulp-server-livereload';
import clean from 'gulp-clean';
import fs from 'fs';
import sourceMaps from 'gulp-sourcemaps';

import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import imagemin from 'gulp-imagemin';
import changed from 'gulp-changed';
import sassGlob from 'gulp-sass-glob';


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
      contacts: './src/js/contacts.js',
      about: './src/js/about.js'
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

gulp.task('js:dev', function () {
   return gulp.src('./src/js/*.js')
      .pipe(changed('./build/js/'))
      .pipe(plumber(plumberNotify('JS')))
      //.pipe(babel())
      .pipe(webpack(config))
      .pipe(gulp.dest('./build/js/'))
})



gulp.task('html:dev', function () {
   return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
      .pipe(changed('./build/', {hasChanged: changed.compareContents}))
      .pipe(plumber(plumberNotify('HTML')))
      .pipe(fileInclude({
         prefix: '@@',
         basepath: '@file',
      }))
      .pipe(gulp.dest('./build/'))
})

gulp.task('sass:dev', function () {
   return gulp.src('./src/scss/*.scss')
      .pipe(changed('./build/css/'))
      .pipe(plumber(plumberNotify('Sass')))
      .pipe(sourceMaps.init())
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest('./build/css/'))
})

gulp.task('images:dev', function () {
   return gulp.src('./src/images/**/*', { encoding: false})
      .pipe(changed('./build/img/'))
     // .pipe(imagemin({ verbose: true }))
      .pipe(gulp.dest('./build/img/'))
})

gulp.task('fonts:dev', function () {
   return gulp.src('./src/fonts/**/*')
      .pipe(changed('./build/fonts/'))
      .pipe(gulp.dest('./build/fonts/'))
})

gulp.task('files:dev', function () {
   return gulp.src('./src/files/**/*')
      .pipe(changed('./build/files/'))
      .pipe(gulp.dest('./build/files/'))
})

gulp.task('server:dev', function () {
   return gulp.src('./build/')
      .pipe(server({
         livereload: true,
         open: true
      }))
})

gulp.task('clean:dev', function (done) {
   if (fs.existsSync('./build/')) {
      return gulp.src('./build/', { read: false })
         .pipe(clean())
   }
   done();
})

gulp.task('watch:dev', function () {
   gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
   gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
   gulp.watch('./src/images/**/*', gulp.parallel('images:dev'));
   gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
   gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
   gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));


})

gulp.task('default', gulp.series(
   'clean:dev',
   gulp.parallel('html:dev', 'sass:dev', 'images:dev', 'fonts:dev', 'files:dev', 'js:dev'),
   gulp.parallel('server:dev', 'watch:dev')))