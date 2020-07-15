require('dotenv').config();
const config = require('./patternlab-config.json');

const gulp = require('gulp');
const less = require('gulp-less');
const shell = require('gulp-shell');
const browserSync = require('browser-sync');
const fs = require('fs');
const prompts = require('prompts');

const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const minify = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const inject = require('gulp-inject');


// Helpers
const cleanDir = (dir) => gulp.src(`${dir}/*`).pipe(clean({ force: true }));;

const componentsExist = (paths) => {
  return paths.filter((path) => {
    return fs.existsSync(path);
  }).length > 0;
};

const symlinksExist = (paths) => {
  return paths.filter((path) => {
    const stats = fs.lstatSync(path);

    return stats.isSymbolicLink();
  }).length > 0;
}

const checkForCopies = async () => {
  const sources = [
    `${process.env.THEME_DIRECTORY}/templates/components`,
    `${process.env.THEME_DIRECTORY}/less/components`,
    `${process.env.THEME_DIRECTORY}/js/components`
  ];

  if (componentsExist(sources) && !symlinksExist(sources)) {
    const response = await prompts({
      type: 'confirm',
      name: 'remove',
      message: 'Looks like working theme has pre-existing components. Would you like to remove and link instead?',
      initial: true
    })

    return response.remove;
  }

  return false;
};

const checkForSymlinks = async () => {
  const sources = [
    `${process.env.THEME_DIRECTORY}/templates/components`,
    `${process.env.THEME_DIRECTORY}/less/components`,
    `${process.env.THEME_DIRECTORY}/js/components`
  ];

  if (componentsExist(sources) && symlinksExist(sources)) {
    const response = await prompts({
      type: 'confirm',
      name: 'unlink',
      message: 'Looks like working theme has pre-existing symbolic links. Would you like to unlink?',
      initial: true
    })

    return response.unlink;
  }

  return false;
};

// Tasks
const cleanPublic = () => cleanDir(config.paths.public.root);
gulp.task(cleanPublic);

const patternLab = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell(['patternlab build --config ./patternlab-config.json']))
    .pipe(browserSync.stream());
};
gulp.task(patternLab);

const styles = () => {
  const source = config.paths.source.styles;
  const dest = config.paths.public.styles;

  return gulp
    .src(`${source}/*.less`)
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(minify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
};
gulp.task(styles);

const bootstrap = () => {
  const stylesheet = `${config.paths.source.styles}/vendor`;

  return gulp.src(`${stylesheet}/bootstrap.less`)
    .pipe(inject(gulp.src(`${process.env.THEME_DIRECTORY}/less/finna/*.less`, { read: false }), {
      starttag: '/* Finna extensions start */',
      endtag: '/* Finna extensions end */',
      ignorePath: '/../NDL-VuFind2/themes',
      transform: (filePath) => {
        return `@import "@{themePath}${filePath}";`
      }
    }))
    .pipe(gulp.dest(stylesheet));
};

const scripts = () => {
  const source = config.paths.source.root;
  const dest = config.paths.public.js;

  return gulp
    .src([`${source}/js/finna.js`, `!${source}/js/vendor/*.js`, `${source}/components/**/*.js`])
    .pipe(concat('main.js'))
    .pipe(gulp.dest(dest))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
};
gulp.task(scripts);

const vendorScripts = () => {
  const source = config.paths.source.js;
  const dest = `${config.paths.public.js}/vendor`;

  return gulp
    .src(`${source}/vendor/*.js`)
    .pipe(gulp.dest(dest))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
};
gulp.task(vendorScripts);

const watchTask = () => {
  browserSync.init({
    server: {
      baseDir: config.paths.public.root,
      routes: {
        '/fonts': `${process.env.THEMES_ROOT}/bootstrap3/css/fonts`,
        '/themes/finna2/css/fonts': `${process.env.THEME_DIRECTORY}/css/fonts`
      }
    },
    ghostMode: true,
    open: 'external',
    snippetOptions: {
      blacklist: ['/index.html', '/']
    }
  });

  gulp.watch(`${config.paths.source.styles}/**/*.less`, styles);
  gulp.watch(`${config.paths.source.patterns}**/*.less`, styles);

  gulp.watch(`${config.paths.source.js}/**/*.js`, scripts);
  gulp.watch(`${config.paths.source.patterns}**/*.js`, scripts);

  gulp.watch(`${config.paths.source.patterns}**/*.phtml`, patternLab);
  gulp.watch(`${config.paths.source.patterns}**/*.json`, patternLab);
};
gulp.task(watchTask);

const componentImports = () => {
  const less = `${process.env.THEME_DIRECTORY}/less`

  return gulp.src(`${less}/custom.less`)
    .pipe(inject(gulp.src(`${less}/components/**/*.less`, { read: false }), {
      starttag: '/* All custom less-code here */',
      endtag: '/* Custom less-code ends */',
      ignorePath: `/${process.env.THEME_DIRECTORY}/less/`,
      addRootSlash: false,
      transform: (filePath) => {
        return `@import "${filePath}";`
      }
    }))
    .pipe(gulp.dest(less))
};
gulp.task(componentImports);

const unlinkPatterns = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell([`rm -rf ${process.env.THEME_DIRECTORY}/templates/components`]))
};
gulp.task(unlinkPatterns);

const unlinkStyles = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell([`rm -rf ${process.env.THEME_DIRECTORY}/less/components`]))
};
gulp.task(unlinkStyles);

const unlinkScripts = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell([`rm -rf ${process.env.THEME_DIRECTORY}/js/components`]))
};
gulp.task(unlinkScripts);

const unlinkTheme = gulp.series(unlinkPatterns, unlinkStyles, unlinkScripts);

const symLinkPatterns = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell([
      `cd ${process.env.THEME_DIRECTORY}/templates && ln -fs ../../../../ui-component-library-proto/source/components`
    ]));
};
gulp.task(symLinkPatterns);

const symLinkStyles = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell([`cd ${process.env.THEME_DIRECTORY}/less && ln -fs ../../../../ui-component-library-proto/source/components`]));
};
gulp.task(symLinkStyles);

const symLinkScripts = () => {
  return gulp
    .src('.', { allowEmpty: true })
    .pipe(shell([`cd ${process.env.THEME_DIRECTORY}/js && ln -fs ../../../../ui-component-library-proto/source/components`]));
};
gulp.task(symLinkScripts);

const shouldRemoveComponents = async (callback) => {
  const shouldRemove = await checkForCopies();

  if (shouldRemove) {
    unlinkTheme();
  }

  callback();
};
gulp.task(shouldRemoveComponents);

const symLinkTheme = gulp.series(
  shouldRemoveComponents,
  symLinkPatterns,
  symLinkStyles,
  symLinkScripts,
  componentImports
);

const copyPatterns = () => {
  const source = config.paths.source.patterns;

  return gulp
    .src(`${source}**/*.phtml`)
    .pipe(gulp.dest(`${process.env.THEME_DIRECTORY}/templates/components`));
};
gulp.task(copyPatterns);

const copyStyles = () => {
  const source = config.paths.source.patterns;

  return gulp
    .src(`${source}**/*.less`)
    .pipe(gulp.dest(`${process.env.THEME_DIRECTORY}/less/components`));
};
gulp.task(copyStyles);

const copyScripts = () => {
  const source = config.paths.source.patterns;

  return gulp
    .src(`${source}**/*.js`)
    .pipe(gulp.dest(`${process.env.THEME_DIRECTORY}/js/components`));
};
gulp.task(copyScripts);

const shouldUnlinkTheme = async (callback) => {
  const shouldUnlink = await checkForSymlinks();

  if (shouldUnlink) {
    unlinkTheme();
  }

  callback();
};
gulp.task(shouldUnlinkTheme);

const copyTheme = gulp.series(
  shouldUnlinkTheme,
  copyPatterns,
  copyStyles,
  copyScripts,
  componentImports
);

const defaultTask = gulp.series(
  cleanPublic,
  gulp.parallel(patternLab, styles, scripts, vendorScripts)
);

const watch = gulp.series(defaultTask, watchTask);

// Descriptions
cleanPublic.description = "Clear all files under public directory";

patternLab.description = "Build PatternLab to public directory";

styles.description = "Convert and minify Less to CSS";

scripts.description = "Build and uglify Javascript into main.js";

vendorScripts.description = "Build and uglify vendor Javascript";

watchTask.description = "Initialize BrowserSync instance and watch for changes";

componentImports.description = "Inject component imports to dedicated files";

shouldUnlinkTheme.description = "Ask if linked components in theme directory should be unlinked";

symLinkPatterns.description = "Create patterns symbolic link";

symLinkStyles.description = "Create styles symbolic link";

symLinkScripts.description = "Create scripts symbolic link";

unlinkPatterns.description = "Remove symbolic link from working patterns";

unlinkStyles.description = "Remove symbolic link from working styles";

unlinkScripts.description = "Remove symbolic link from working scripts";

shouldRemoveComponents.description = "Ask if existing components in theme directory should be removed";

copyPatterns.description = "Create patterns copy";

copyStyles.description = "Create styles copy";

copyScripts.description = "Create Javascript scripts copy";

defaultTask.description = "Clear public directory and build patterns, CSS and Javascript from the source directory";

watch.description = 'Build PatternLab from source files and watch for changes.';

symLinkTheme.description = "Create symbolic link to working theme";

unlinkTheme.description = "Unlink/remove components from theme";

copyTheme.description = "Create distributable copy to working theme";

bootstrap.description = "Bootstrap Finna Less extensions";

// Exports
exports.watch = watch;
exports.symLinkTheme = symLinkTheme;
exports.copyTheme = copyTheme;
exports.bootstrap = bootstrap;
exports.unlinkTheme = unlinkTheme;

