const gulp = require('gulp');
const bump = require('gulp-bump');
const sass = require('gulp-sass');
const fs = require('fs');
const ts = require('gulp-typescript');
const project = ts.createProject('tsconfig.json');

sass.compiler = require('node-sass');

gulp.task('sass', () => gulp.src('src/styles/*.scss').pipe(sass().on('error', sass.logError)).pipe(gulp.dest('dist/styles')));

gulp.task('sass:watch', () => gulp.watch('./sass/**/*.scss', ['sass']));

gulp.task('compile', () => gulp.src('src/**/*.ts').pipe(project()).pipe(gulp.dest('dist/')));

gulp.task('copy', async () => {
  return new Promise((resolve) => {
    gulp.src('README.md').pipe(gulp.dest('dist/'));
    gulp.src('LICENSE').pipe(gulp.dest('dist/'));
    gulp.src(['src/**.json', '!src/tsconfig.json', 'src/**/**.js']).pipe(gulp.dest('dist/'));
    gulp.src('src/lang/**').pipe(gulp.dest('dist/lang/'));
    gulp.src('src/templates/**').pipe(gulp.dest('dist/templates/'));
    gulp.src('src/styles/**.css').pipe(gulp.dest('dist/styles/'));
    gulp.src('src/assets/**').pipe(gulp.dest('dist/assets/'));
    gulp.src('src/packs/**').pipe(gulp.dest('dist/packs/'));
    resolve(null);
  });
});

gulp.task('build', gulp.parallel('compile', 'copy', 'sass'));

// This is supposed to copy the dist folder into the modules directory for testing. Only works if you've set it up the right way
// This works if development path is FoundryVTT/Data/dev/modules/swade-item-macros
const SYSTEMPATH = '../../../../AppData/Local/FoundryVTT/Data/systems/carroy/';
gulp.task('foundry', () => {
  return gulp.src('dist/**').pipe(gulp.dest(SYSTEMPATH));
});
gulp.task('update', gulp.series('build', 'foundry'));

//Bump version
const version = JSON.parse(fs.readFileSync('./package.json')).version;
gulp.task('bump', () =>
  gulp
    .src('src/system.json')
    .pipe(bump({ version: version }))
    .pipe(gulp.dest('src/'))
);

gulp.task('patch', () => gulp.src('src/system.json').pipe(bump()).pipe(gulp.dest('src/')));

gulp.task('minor', () =>
  gulp
    .src('src/system.json')
    .pipe(bump({ type: 'minor' }))
    .pipe(gulp.dest('src/'))
);

gulp.task('major', () =>
  gulp
    .src('src/system.json')
    .pipe(bump({ type: 'major' }))
    .pipe(gulp.dest('src/'))
);
