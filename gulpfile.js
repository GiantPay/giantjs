const gulp = require('gulp')
const babel = require('gulp-babel')
const watch = require('gulp-watch')
// const eslint = require('gulp-eslint')

// gulp.task('eslint', () =>
//     gulp.src(['src/**'])
//         .pipe(eslint())
//         .pipe(eslint.format())
//         .pipe(eslint.failAfterError())
// )

gulp.task('watch', () =>
    gulp.src('src/**')
        .pipe(watch('src/**', {
            verbose: true
        }))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('dist'))
)

gulp.task('default', () =>
    gulp.src('src/**')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('dist'))
)
