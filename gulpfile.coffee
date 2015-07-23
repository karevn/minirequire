gulp = require('gulp')
watch = require('gulp-watch')
coffee = require('gulp-coffee')
sourcemaps = require('gulp-sourcemaps')

gulp.task 'build', ->
	gulp.src('./minirequire.coffee').pipe(coffee()).pipe(gulp.dest('./'))

gulp.task 'default', ['build']
gulp.task 'watch', -> watch "*.coffee", ['build']