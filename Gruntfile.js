/*eslint-env node*/
/*eslint no-console: 0*/
/*eslint quote-props: [2, "as-needed"]*/
/*eslint prefer-arrow-callback: 0*/
var Path = require('path');
var Config = require('./config/');

module.exports = function (grunt) {

  var configDev = new Config({
    mode: 'dev'
  });
  var configDist = new Config({
    mode: 'dist'
  });

  // Add loader for Grunt plugins
  require('matchdep').filterDev([ 'grunt-*' ]).forEach(grunt.loadNpmTasks);
  // Write temp file so grunt does not fail to read
  grunt.file.write('build/app/themes/stacked/default.css','DEFAULT_THEME_CSS_APPENDED_HERE');

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    babel: {
      options: {
        sourceMaps: true
      },
      dev: {
        options: {
          modules: 'amd'
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['app/**/*.babel.js','!app/config.babel.js','!app/commonConfig.babel.js','!app/main-config.babel.js'],
          dest: 'build/',
          ext: '.js'
        }]
      },
      devConfig: {
        options: {
          modules: 'ignore'
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['app/config.babel.js','app/commonConfig.babel.js','app/main-config.babel.js'],
          dest: 'build/',
          ext: '.js'
        }]
      }
    },

    browserSync: {
      dist: {
        bsFiles: {
          src: 'dist/'
        },
        options: {
          server: {
            baseDir: './dist'
          },
          port: 4000,
          ui: {
            port: 5000,
            weinre: {
              port: 5050
            }
          }
        }
      }
    },

    clean: {
      dist: [ 'dist/' ],
      build: [ 'build/' ],
      fontsSrc: ['src/resources/fonts/google/'],
      fontsDist: ['dist/resources/css','dist/resources/scss']
    },

    concat: {
      options: {
				stripBanners: true,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - '
        + '<%= grunt.template.today("yyyy-mm-dd, hh:MM:ss TT") %> - '
        + 'This application is released under the Apache License V2.0 by Esri http://www.esri.com/ - '
        + 'https://github.com/Esri/crowdsource-storytelling-template-js */'
			},
      config: {
        src: ['build/app/config.js'],
        dest: 'dist/app/config.js'
      },
      builderJS: {
				src: ['dist/app/main-app-builder.min.js'],
				dest: 'dist/app/main-app-builder.min.js'
			},
			viewerJS: {
				src: ['dist/app/main-app.min.js'],
				dest: 'dist/app/main-app.min.js'
			},
      viewerCSS: {
        files: [ {
          expand: true,
          cwd: 'dist/',
          src: [ 'app/*.min.css' ],
          dest: 'dist/'
        } ]
			}
    },

    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      devWatch: [ 'nodemon:dev', 'watch' ]
    },

    copy: {
      resources: {
        files: [ {
          expand: true,
          cwd: 'src/',
          src: [ 'resources/**' ],
          dest: 'dist/'
        } ]
      }
    },

    eslint: {
      options: {
          configFile: '.eslintrc'
      },
      target: ['src/app/**/*.js']
    },

    googlefonts: configDev.fonts.getGoogleFontsConfig(),

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          removeEmptyAttributes: true,
          removeIgnored: true,
          minifyJS: true,
          minifyCSS: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },

    nodemon: {
      dev: {
        options: {
          watch: [ '*.js', './config/server/**/*.js' ],
          ext: 'js,html',
          env: {
            MODE: 'dev'
          },
          callback: function (nodemon) {

            nodemon.on('restart', function () {

              console.log('restart');
              setTimeout(function () {

                grunt.file.write('.rebooted', 'rebooted');

              }, 1000);

            });

          }
        },
        script: 'server.js'
      },
      dist: {
        options: {
          MODE: 'dist'
        },
        script: 'server.js'
      }
    },

    open: {
      options: {
        delay: 3000
      },
      dev: {
        path: 'http://localhost:' + configDev.server.manifest.connections[ 0 ].port
      },
      dist: {
        path: 'http://localhost:4000'
      }
    },

    'regex-replace': {
      distHtml: {
        src: ['dist/index.html'],
        actions: [
          {
            name: 'Remore htmlmin:ignore tags',
						search: '<!-- htmlmin:ignore -->',
						replace: '',
						flags: 'g'
          }
        ]
      },
      defaultFonts: {
        src: ['build/app/store/reducers/items/app/data/settings/layout/Layout.js'],
        actions: [
          {
            name: 'Add Font CSS to default config',
						search: 'DEFAULT_FONT_CSS_APPENDED_HERE',
						replace: function() {
              return grunt.file.read('build/resources/fonts/google/css/latoMerriweather.css').trim();
            },
						flags: 'g'
          }
        ]
      },
      defaultLayout: {
        src: ['build/app/store/reducers/items/app/data/settings/layout/Layout.js'],
        actions: [
          {
            name: 'Add Stacked CSS Layout String',
						search: 'DEFAULT_LAYOUT_CSS_APPENDED_HERE',
						replace: function() {
              return grunt.file.read('build/app/layouts/stacked.css').trim();
            },
						flags: 'g'
          }
        ]
      },
      defaultTheme: {
        src: ['build/app/store/reducers/items/app/data/settings/layout/Layout.js'],
        actions: [
          {
            name: 'Add Default CSS Theme String',
						search: 'DEFAULT_THEME_CSS_APPENDED_HERE',
						replace: function() {
              return grunt.file.read('build/app/themes/stacked/default.css').trim();
            },
						flags: 'g'
          }
        ]
      },
      i18nAlias: {
        src: ['dist/app/main-config.min.js'],
        actions: [
          {
            name: 'Remove i18n Alias',
						search: 'i18n:"dojo/i18n"',
						replace: '',
						flags: 'g'
          }
        ]
      },
      i18nPlugin: {
        src: ['dist/**/*.js'],
        actions: [
          {
            name: 'Replace i18n! with dojo/i18n!',
						search: 'i18n!',
						replace: 'dojo/i18n!',
						flags: 'g'
          }
        ]
      },
      stylesheetQuotes: {
        src: ['build/**/*.css'],
        actions: [
          {
            name: 'Replace double quotes with single quotes',
						search: '\"',
						replace: '\'',
						flags: 'g'
          }
        ]
      }
    },

    requirejs: {
      options: {
        baseUrl: 'src/',
        paths: {
          /* Ignore modules of the following packages */
          dojo: 'empty:',
          esri: 'empty:',
          dijit: 'empty:',
          dojox: 'empty:',
          translations: 'empty:',
          babel: '../build/app',
          lib: 'lib',
          jquery: 'lib/jquery/dist/jquery',
          velocity: 'lib/velocity/velocity',
          react: 'lib/react/react-with-addons',
          reactDom: 'lib/react/react-dom',
          reactRedux: 'lib/react-redux/index',
          redux: 'lib/redux/index',
          bootstrap: 'lib/bootstrap-sass/assets/javascripts/bootstrap',
          // AMD Plugins
          mode: '../build/app/utils/amd/plugins/AppMode',
          i18n: 'lib/i18n/i18n'
        },
        inlineText: true,
				separateCSS: true,
				preserveLicenseComments: false
      },
      viewerJS: {
        options: {
          name: '../config/requireBuilds/main-app',
          out: 'dist/app/main-app.min.js'
        }
      },
      builderJS: {
        options: {
          config: {
            mode: 'isBuilder'
          },
          name: '../config/requireBuilds/main-app',
          out: 'dist/app/main-app-builder.min.js'
        }
      }
    },

    sass: {
      options: {
        includePaths: ['src/app/components/',
        'src/lib/bourbon/app/assets/stylesheets/',
        'src/lib/calcite-bootstrap/sass/',
        'src/lib/bootstrap-sass/assets/stylesheets/',
        'src/lib/']
      },
      dev: {
        files: {
          'build/app/components/crowdsource/viewer/CrowdsourceApp.css': 'src/app/components/crowdsource/viewer/CrowdsourceApp.scss',
          'build/app/components/crowdsource/builder/CrowdsourceApp-builder.css': 'src/app/components/crowdsource/builder/CrowdsourceApp-builder.scss',
          'build/app/components/crowdsource/viewer/CrowdsourceApp-calcite.css': 'src/app/components/crowdsource/viewer/CrowdsourceApp-calcite.scss',
          'build/app/components/crowdsource/builder/CrowdsourceApp-builder-calcite.css': 'src/app/components/crowdsource/builder/CrowdsourceApp-builder-calcite.scss',
          'build/app/components/crowdsource/viewer/CrowdsourceApp-bootstrap.css': 'src/app/components/crowdsource/viewer/CrowdsourceApp-bootstrap.scss',
          'build/app/components/crowdsource/builder/CrowdsourceApp-builder-bootstrap.css': 'src/app/components/crowdsource/builder/CrowdsourceApp-builder-bootstrap.scss'
        }
      },
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceMap: false
        },
        files: {
          'dist/app/main-app.min.css': 'src/app/components/crowdsource/viewer/CrowdsourceApp.scss',
          'dist/app/main-app-builder.min.css': 'src/app/components/crowdsource/builder/CrowdsourceApp-builder.scss',
          'dist/app/main-app-calcite.min.css': 'src/app/components/crowdsource/viewer/CrowdsourceApp-calcite.scss',
          'dist/app/main-app-builder-calcite.min.css': 'src/app/components/crowdsource/builder/CrowdsourceApp-builder-calcite.scss',
          'dist/app/main-app-bootstrap.min.css': 'src/app/components/crowdsource/viewer/CrowdsourceApp-bootstrap.scss',
          'dist/app/main-app-builder-bootstrap.min.css': 'src/app/components/crowdsource/builder/CrowdsourceApp-builder-bootstrap.scss'
        }
      },
      fonts: {
        options: {
          outputStyle: 'compressed',
          sourceMap: false
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['resources/fonts/google/css/*.scss'],
          dest: 'build/',
          ext: '.css'
        }]
      },
      layouts: {
        options: {
          outputStyle: 'compressed',
          sourceMap: false
        },
        files: {
          'build/app/layouts/stacked.css': 'src/app/components/crowdsource/styles/layouts/stacked/Stacked.scss'
        }
      },
      themes: {
        options: {
          outputStyle: 'compressed',
          sourceMap: false
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: [ 'app/themes/**/*.scss' ],
          dest: 'build/',
          ext: '.css'
        }]
      }
    },

    swig: {
      dev: {
        options: {
          data: configDev
        },
        dest: 'build/index.html',
        src: [ 'src/index.swig' ]
      },
      dist: {
        options: {
          data: configDist
        },
        dest: 'dist/index.html',
        src: [ 'src/index.swig' ]
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - '
        + '<%= grunt.template.today("yyyy-mm-dd, hh:MM:ss TT") %> - '
        + 'This application is released under the Apache License V2.0 by Esri http://www.esri.com/ - '
        + 'https://github.com/Esri/crowdsource-storytelling-template-js */',
        mangle: {
          except: ['define','require']
        }
      },
      distConfig: {
        files: [{
          'dist/app/commonConfig.min.js': ['build/app/commonConfig.js'],
          'dist/app/main-config.min.js': ['build/app/main-config.js']
        }]
      }
    },

    watch: {
      options: {
        livereload: true
      },
      babel: {
        files: [ 'src/app/**/*.babel.js' ],
        tasks: ['babelAndAppend']
      },
      eslint: {
        files: [ 'src/app/**/*.js' ],
        tasks: [ 'eslint' ]
      },
      sass: {
        files: [ 'src/app/components/**/*.scss','!src/app/components/crowdsource/styles/layouts/**/*.scss' ],
        tasks: [ 'sass:dev' ]
      },
      fonts: {
        files: ['src/resources/fonts/google/**/*.scss'],
        tasks: ['babelAndAppend']
      },
      layouts: {
        files: ['src/app/components/crowdsource/styles/layouts/**/*.scss'],
        tasks: ['babelAndAppend']
      },
      themes: {
        files: [ 'src/app/themes/**/*.scss' ],
        tasks: ['babelAndAppend']
      },
      swig: {
        files: [ 'src/*.swig' ],
        tasks: [ 'swig:dev' ]
      },
      otherFiles: {
        files: ['.rebooted', 'src/app/**/*.html']
      }
    },

    concatFontStyle: {
      files: [ 'src/resources/fonts/google/css/*.scss' ]
    }

  });

  grunt.registerMultiTask('concatFontStyle','Add default styles to google font stylesheets',function(){
    var files = this.filesSrc;

    files.map(function(file) {
      var name = Path.basename(file,'.scss');

      var styles = grunt.file.read(file).trim() + configDev.fonts.getSassVariables(name) + grunt.file.read('config/fonts/defaultStyle.scss').trim();

      grunt.file.delete(file);
      grunt.file.write(file,styles);
    });
  });

  // Grunt tasks
  grunt.registerTask('default', [
    'eslint',
    'clean:build',
    'clean:fontsSrc',
    'googlefonts',
    'concatFontStyle',
    'swig:dev',
    'babelAndAppend',
    'sass:dev',
    'open:dev',
    'concurrent:devWatch'
  ]);

  grunt.registerTask('build', [
    'eslint',
    'clean:dist',
    'clean:fontsDist',
    'googlefonts',
    'concatFontStyle',
    'copy:resources',
    'swig:dist',
    'htmlmin:dist',
    'regex-replace:distHtml',
    'sass:dist',
    'babelAndAppend',
    'requirejs',
    'uglify',
    'concat',
    'regex-replace:i18nAlias',
    'regex-replace:i18nPlugin'
  ]);

  grunt.registerTask('test', [
    'build',
    'browserSync:dist'
  ]);

  grunt.registerTask('babelAndAppend', [
    'babel',
    'sass:layouts',
    'sass:themes',
    'sass:fonts',
    'regex-replace:stylesheetQuotes',
    'regex-replace:defaultLayout',
    'regex-replace:defaultTheme',
    'regex-replace:defaultFonts'
  ]);
};
