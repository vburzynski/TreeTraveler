// Generated on 2014-08-27 using generator-webapp 0.4.9
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'src',
        dist: 'dist',
        examples: 'examples',
        test: 'test'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            test: {
                options: {
                    open: true,
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(config.app)
                        ];
                    },
                    keepalive: true
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            // clean the server temp folder
            server: '.tmp',
            // clean out test build
            test: [
                '<%= config.test %>/bower_components',
                '<%= config.test %>/scripts/config.js'
            ]
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: false,
                    tiemout: 10000,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= config.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            test: [
                'copy:styles'
            ]
        }
    });
    
    // run unit tests
    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:server',
            'connect:test'
        ]);
    });
    
    // build project
    grunt.registerTask('build', function(){
        var target = grunt.option('target') || "dev";
        if (target === "dev" ) {
            // TODO populate dist directory
        } else if (target === "examples") {
            // TODO build examples grunt task
        } else if (target === "test"){
            // FIXME not complete yet
            grunt.task.run([
                'clean:test'
            ]);
        }
    });
    
    // default task...
    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};