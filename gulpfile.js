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