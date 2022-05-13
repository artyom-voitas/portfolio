const gulp = require('gulp'),
      browserSync = require('browser-sync'),
      sass = require('gulp-sass')(require('sass')),
      autoprefixer = require('gulp-autoprefixer'),
      cleanCSS = require('gulp-clean-css'),
      pug = require('gulp-pug'),
      plumber = require('gulp-plumber'),
      concat = require('gulp-concat'),
      del = require('del');

// функция обновления страницы при изменениях в файлах билда
function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'build'
        }
    })
}

// функция для преобразования pug в html
function html() {
    return gulp.src('src/pug/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('build'))
        .on('end', browserSync.reload)
}

// функция преобразования scss в css
function css() {
    return gulp.src('src/assets/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            grid: 'autoplace',
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('build/assets/css'))
        .pipe(browserSync.stream())
}

// функция js
function js() {
    return gulp.src('src/assets/js/app.js')
        .pipe(gulp.dest('build/assets/js'))
        .pipe(browserSync.stream())
}

// функция копирования изображений
function images() {
    return gulp.src('src/assets/imgs/**/*')
        .pipe(gulp.dest('build/assets/imgs'))
        .pipe(browserSync.stream())
}

// функция копирования шрифтов
function fonts() {
    return gulp.src('src/assets/fonts/*')
        .pipe(gulp.dest('build/assets/fonts'))
        .pipe(browserSync.stream())
}

// функция js модулей
function vendorJS() {
    return gulp.src([
            'node_modules/swiper/swiper-bundle.min.js',
        ])
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest('build/assets/js'))
        .pipe(browserSync.stream())
}

// функция css модулей  
function vendorCSS() {
    return gulp.src([
        'node_modules/swiper/swiper-bundle.min.css',
        ])
        .pipe(concat('vendors.min.css'))
        .pipe(gulp.dest('build/assets/css'))
        .pipe(browserSync.stream())
}

// функция очистки
function clear() {
    return del('build', {force: true});
}

// функция отслеживания изменения в файлах исходников
function watcher() {
    gulp.watch('src/pug/**/*.pug', html)
    gulp.watch('src/assets/scss/**/*.scss', css)
    gulp.watch('src/assets/js/*.js', js)
    gulp.watch('src/assets/imgs/**/*', images)
    gulp.watch('src/assets/fonts/*', fonts)
}

//команда запуска по умолчанию (gulp)
gulp.task(
    'default',
    gulp.series(
        gulp.parallel(html, css, js, images, vendorJS, vendorCSS, fonts),
        gulp.parallel(watcher, browsersync)
    )
);

//команда запуска продакшн (gulp build)
gulp.task(
    'build',
    gulp.series(clear,
        gulp.parallel(html, css, images)
    )
);

var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: './src/assets/imgs/master_picture.png',
		dest: './src/assets/imgs/icons',
		iconsPath: './src/assets/imgs/icons',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {
				design: 'background',
				backgroundColor: '#333333',
				backgroundRadius: 0.85,
				imageScale: 0.7
			},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'silhouette',
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
	return gulp.src([ './build/index.html' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('./build'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});