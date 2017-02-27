var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: './www/js/',
  lib: './www/lib/js/',
  bower: './www/lib/'
};

gulp.task('default', ['sass', 'scripts']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('scripts', function(done) {

  gulp.src([
    paths.bower+'firebase/firebase.js',
    paths.bower+'moment/min/moment.min.js',
    paths.bower+'angularfire/dist/angularfire.min.js',
    paths.bower+'angular-moment/angular-moment.min.js',
    paths.bower+'ionic-modal-select/dist/ionic-modal-select.min.js',
    paths.bower+'ngCordova/dist/ng-cordova.min.js',
    paths.bower+'checklist-model/checklist-model.js',
    paths.js+'inview.js',
    paths.js+'gallery.js',
    paths.js+'irk.js'
    ])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('compact.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.bower))
    .on('end', done);

  // gulp.src([
  //   paths.js+'app.js',
  //   paths.js+'services.js',
  //   paths.js+'controllers.js'
  //   ])
  //   .pipe(sourcemaps.init({loadMaps: true}))
  //   .pipe(concat('app.min.js'))
  //   .pipe(uglify())
  //   .pipe(sourcemaps.write('.'))
  //   .pipe(gulp.dest(paths.lib))
  //   .on('end', done);

});

gulp.task('watch', ['sass'], function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
