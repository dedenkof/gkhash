'use strict';

const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    svgmin = require('gulp-svgmin'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    gcmq = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    minJS = require('gulp-uglify'),
    rename = require('gulp-rename'),
    includeFiles = require('gulp-rigger'),
    browserSync = require('browser-sync'),
    inject = require('gulp-inject'),
    rimraf = require('rimraf'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    spritesmith = require('gulp.spritesmith'),
    googleWebFonts = require('gulp-google-webfonts'),
    replace = require('gulp-replace'),
    htmlmin = require('gulp-htmlmin'),
    cache = require('gulp-cache'),
    flatten = require('gulp-flatten'),
    gifsicle = require('imagemin-gifsicle'),
    jpegtran = require('imagemin-jpegtran'),
    optipng = require('imagemin-optipng'),
    stylelint = require('stylelint'),
    /* Generate favicon */
    realFavicon = require('gulp-real-favicon'),
    fs = require('fs'),
    /* //Generate favicon */
    npmDist = require('gulp-npm-dist');

// INITIAL path value

const path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        svg: 'build/img/svg/',
        injectCSS: 'build/css/**/*.css',
        injectFontsCSS: 'build/fonts/**/*.css',
        injectJS: 'build/js/**/*.js'
    },

    // inject order file (include file optional manually)
    inject: {
        css: {
            bootstrap: 'build/css/bootstrap/bootstrap.min.css',
            bootstrapGrid: 'build/css/bootstrap/bootstrap-grid.min.css',
            animate: 'build/css/animate/animate.min.css',
            custom: 'build/css/custom.min.css'
        },
        js: {
            jsHTML5: {
                es5: 'build/js/html5shiv/es5-shim.min.js',
                print: 'build/js/html5shiv/html5shiv-printshiv.min.js',
                html5shiv: 'build/js/html5shiv/html5shiv.min.js'
            },
            jquery: 'build/js/jquery/jquery.min.js',
            rangeslider: 'build/js/rangeslider/rangeslider.min.js',
            jqPayment: 'build/js/jqpayment/jquery.payment.min.js',
            main: 'build/js/main.min.js'

        }
    },
    src: {
        src: 'src/',
        mainHTML: 'src/index.html',
        html: 'src/*.html',
        js: 'src/js/*.js',
        jsLib: 'src/js/libs/**/*.js',
        css: 'src/css/**/*.css',
        cssLib: 'src/css/libs/**/*.css',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.{png,xml,jpg,gif,svg,ico,webmanifest}',
        fonts: 'src/fonts/**/*.*',
        fontsGoogle: 'src/fonts/',
        svg: 'src/img/uploads/svg-sprite-pack/**/*.svg',
        extSVG: '.svg',
        extPNG: '.png'
    },
    libsCSS: {
        bootstrapCSS: 'node_modules/bootstrap/dist/css/bootstrap.css',
        bootstrapGrid: 'node_modules/bootstrap/dist/css/bootstrap-grid.css',
    },
    libsJS: {
        jquery: 'node_modules/jquery/dist/jquery.js',
        bootstrapJS: 'node_modules/bootstrap/dist/js/bootstrap.js'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.scss',
        sass: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        svg: 'src/img/svg/**/*.svg'
    },

    cleanBuild: './build'
};

// CONFIG settings file

// Google Web Fonts options
const options = {
    relativePaths: true,
    fontsDir: 'googlefonts/',
    cssDir: 'googlecss/',
    cssFilename: 'googlefonts.css'
};

// Config autoprefixer add prefix to the browsers
const autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];

// browserSync config
const config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    // startPath: 'index.html',
    host: 'localhost',
    port: 9000,
    //proxy: "yourlocal.dev",
    logPrefix: "Frontend_History_Action"
};

// Notify error
const onError = function (err) {
    notify.onError({
        title: 'Error in ' + err.plugin,
    })(err);
    this.emit('end');
};


// Listing package.json dependencies and copy js libs files of them  to build/css
gulp.task('copyLibsJS', () =>
    gulp.src(npmDist({
        excludes: [
            '/**/*.txt',
            '/**/*.css',
            '/**/core.js',
            '/**/jquery.slim.min.js',
            '/**/bootstrap.bundle.min.js'
        ]
    }), {base: './node_modules'})
        .pipe(flatten({includeParents: 1}))
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(minJS())
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Deploy html files (rigger template from ./tempalte )
gulp.task('html', () =>
    gulp.src(path.src.html)
        .pipe(plumber({errorHandler: onError}))
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
        .pipe(gulp.dest(path.build.html))
        .on('end', browserSync.reload)
);


// Deploy css via sass preprocessor
gulp.task('sass', () =>
    gulp.src(path.src.sass)
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer({browsers: autoprefixerList, cascade: false}))
        .pipe(gcmq())
        .pipe(concat('custom.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({
            stream: true
        }))
);


// Copy src/js/libs and node_modules source to build/js
gulp.task('scriptsLibs', () =>
    gulp.src(path.src.jsLib)
        .pipe(includeFiles())
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(minJS())
        ///.pipe(concat('libs.js'))
        //.pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Transfer custom js to build
gulp.task('scripts', () =>
    gulp.src(path.src.js)
        .pipe(includeFiles())
        .pipe(plumber({errorHandler: onError}))
        .pipe(sourcemaps.init())
        .pipe(minJS())
        //.pipe(concat('general.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.', {addComment: false}))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Include style, js, favicon and markup to main page
gulp.task('inject', (done) => {

    const injectStyles = gulp.src([
        path.build.injectFontsCSS,
        path.inject.css.custom

    ], {read: false});

    const injectScripts = gulp.src([
        path.inject.js.jsHTML5.es5,
        path.inject.js.jsHTML5.print,
        path.inject.js.jsHTML5.html5shiv,
        path.inject.js.jquery,
        path.inject.js.main
    ], {read: false});

    gulp.src(path.src.html)
        .pipe(includeFiles())
        .pipe(inject(injectStyles, {ignorePath: 'build', addRootSlash: false, relative: false}))
        .pipe(inject(injectScripts, {ignorePath: 'build', addRootSlash: false, relative: false}))

        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({
            stream: true
        }));
    done();
});


// Copy all generated img files into build directory
gulp.task('images', () =>
    gulp.src([
        path.src.img,
    ])
        .pipe(gulp.dest(path.build.img))
        .pipe(cache(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.jpegtran({progressive: true}),
                imagemin.optipng({optimizationLevel: 8}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ], {
                verbose: true // output status treatment img files
            }
        )))

        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.reload({
            stream: true
        }))
);

// Download and generate css files google fonts
gulp.task('googleFonts', () =>
    gulp.src('./googlefonts.list')
        .pipe(googleWebFonts(options))
        .pipe(gulp.dest(`${path.build.fonts}google`))
);

// Copy all fonts include google into build directory
gulp.task('fonts', () =>
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
);


//testing your build html files
gulp.task('validation', () =>
    gulp.src(`${path.build.html}**/*.html`)

        .pipe(html5Lint())
);
//testing your build css files
gulp.task('cssLint', () =>
    gulp.src(path.src.sass)
        .pipe(stylelint())
);

// reload after change via browserSync
gulp.task('serve', () => {
        browserSync(config);
    }
);

// delete build dir
gulp.task('clean', (cb) =>
    rimraf(path.cleanBuild, cb)
);

// clear cashe images
gulp.task('clearCache', () =>
    cache.clearAll()
);


gulp.task('watch', function () {
    /*gulp.watch(path.watch.pug, gulp.series('pug'));
    gulp.watch(path.watch.htaccess, gulp.series('htaccess'));*/
    gulp.watch(path.watch.html, gulp.series('html', 'inject'));
    //gulp.watch(path.watch.php, gulp.series('php'));
    gulp.watch(path.watch.sass, gulp.series('sass'));
    gulp.watch(path.watch.js, gulp.series('scripts'));
    gulp.watch(path.watch.js, gulp.series('scriptsLibs'));
    gulp.watch(path.watch.img, gulp.series('images'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
    // gulp.watch(path.watch.robotsTXT, gulp.series('robotsTXT'));
    //gulp.watch(path.watch.favicons, gulp.series('generate-favicon'));
});

/*-- MANUALLY RUN TASK --*/
// ['deploy', 'sftp', 'validation', 'cssLint', 'clearCache', 'check-for-favicon-update']

/*-- GULP RUN ALL TASK CMD GULP --*/

gulp.task('assetsBASE', gulp.series(['html']));  // IF need add 'pug', 'php', tasks

gulp.task('assetsCSS', gulp.series(['sass'])); // IF need add stylus

gulp.task('assetsJS', gulp.series(['scriptsLibs', 'copyLibsJS', 'scripts']));

// gulp.task('assetsIMG', gulp.series(['generate-favicon', 'images']));

gulp.task('assetsIMG', gulp.series(['images']));

gulp.task('assetsFONTS', gulp.series(['googleFonts', 'fonts']));

gulp.task('build', gulp.series(['clean', gulp.parallel('assetsBASE', 'assetsIMG', 'assetsCSS', 'assetsJS', 'assetsFONTS')]));

// gulp.task('injectFiles', gulp.series('inject'));

gulp.task('default', gulp.series(['build', 'inject', gulp.parallel('watch', 'serve')]));
