'use strict';

import plugins       from 'gulp-load-plugins';
import browser       from 'browser-sync';
import gulp          from 'gulp';
import autoprefixer  from 'autoprefixer';

// Load all Gulp plugins into one variable
const $ = plugins();

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series(sass, server, watch));


// Compile Sass into CSS
function sass() {
  const postCssPlugins = [
    // Autoprefixer
    autoprefixer(),
  ].filter(Boolean);
  var source = 'src/scss/*.scss';
  $.sass.compiler = require('node-sass');
  return gulp.src(source)
    .pipe($.sass({
      includePaths: ["node_modules/foundation-sites/scss", "node_modules/motion-ui/src"]
    })
    .on('error', $.sass.logError))
    .pipe($.postcss(postCssPlugins))
    .pipe(gulp.dest('src/html/ss'))
    .pipe(browser.reload({ stream: true }));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: 'src/html/', port: 8080
  }, done);
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch('src/**/*.{html,scss,js}').on('all', gulp.series(sass, reload));
}
// end