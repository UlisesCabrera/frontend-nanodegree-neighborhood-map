//npm install gulp gulp-uglify gulp-htmlmin gulp-html-replace gulp-minify-css gulp-concat gulp-rename gulp-imagemin --save-dev
var gulp = require('gulp'), 
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	htmlreplace = require('gulp-html-replace'),
	cssmin = require('gulp-minify-css'),
	htmlmin = require('gulp-htmlmin'),
	browserSync = require('browser-sync').create(),
	imagemin = require('gulp-imagemin');
	
var reload      = browserSync.reload;

gulp.task('default', ['scripts','html','css','images','watch', 'bSync']);

gulp.task('scripts', function(){
	return gulp.src('src/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'))
});

gulp.task('bSync', ['scripts'], function(){
	browserSync.init({
		server: {
			baseDir: "src/",
			index: "index.html"
			}
		});

	gulp.watch("src/*.html").on("change", browserSync.reload);
	gulp.watch("src/css/*.css").on("change", browserSync.reload);
	gulp.watch("src/js/*.js").on("change", browserSync.reload);

});

gulp.task('html', ['scripts'], function (){
	gulp.src('src/index.html')
		.pipe(htmlreplace({
			'js' : 'js/bundle.min.js'
		}))
		.pipe(htmlmin({collapseWhitespace : true}))
		.pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
    return gulp.src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
});

gulp.task('css', function(){
	return gulp.src('src/css/*.css')
		.pipe(cssmin())
		.pipe(gulp.dest('dist/css'))
})

gulp.task('watch', function(){
	gulp.watch('src/js/*.js',['scripts']);
	gulp.watch('src/images/*',['images']);
	gulp.watch('src/css/*',['css']);
	gulp.watch('src/index.html', ['html']);
});