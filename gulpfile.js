const babel = require('gulp-babel');
const babelify = require("babelify");
const browserify = require('browserify');
const concat = require('gulp-concat');
const del = require('del');
const buffer = require('vinyl-buffer');
const globify = require('require-globify');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');

const srcEntry = './src/Flux.js',
      srcJs = ['src/**/*'],
      testJs = 'test/src/**/*',
      testOutJsDir = 'test/js',
      testOutJsName = 'test.js',
      outJsDir = 'build',
      outJsName = 'flux.js';

function onError(err) {
  console.log(err.message);
  console.log(err.stack);
  this.emit('end');
}

// Remove compiled flux files.
gulp.task('cleanScripts', function() {
  return del([`${outJsDir}/${outJsName}`, `${testOutJsDir}/${outJsName}`]);
});

// Remove compiled test files.
gulp.task('cleanExample', function() {
  return del([`${testOutJsDir}/${testOutJsName}`]);
});

// Process flux src files.
gulp.task('scripts', ['cleanScripts'], function() {
  return browserify()
    .add(srcEntry)
    .transform(babelify.configure({
      presets: ['react', 'es2015', 'stage-0', 'stage-1', 'stage-2']
    }))
    .transform(globify)
    .on('error', onError)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    // .pipe(sourcemaps.init())
    .on('error', onError)
    .pipe(uglify())
    .pipe(concat(outJsName))
  // .pipe(sourcemaps.write())
  .pipe(gulp.dest(outJsDir))
  .pipe(gulp.dest(testOutJsDir));
});

// Process test/test project.
gulp.task('test', ['cleanExample'], function() {
  return gulp.src(testJs)
    // .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['react', 'es2015', 'stage-0', 'stage-1', 'stage-2']
    }))
    .on('error', onError)
    .pipe(concat(testOutJsName))
  // .pipe(sourcemaps.write())
  .pipe(gulp.dest(testOutJsDir));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(srcJs, ['scripts']);
  gulp.watch(testJs, ['test']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts', 'test']);
