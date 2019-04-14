const gulp = require('gulp');

const buildFolder = 'build/'

function clean(cb) {
  cb();
}

function build(cb) {
  // body omitted
  cb();
	packageFile()
}

// Copy package.json to dist
function packageFile() {
  return gulp.src('package.json').pipe(gulp.dest(buildFolder));
};

exports.build = build;
exports.default = gulp.series(clean, build);
