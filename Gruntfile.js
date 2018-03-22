'use strict';

/*global module*/
module.exports = function (grunt) {
    grunt.config.init({
        'copy': {
            'res_pixi': {
                'expand': true,
                'nonull': true,
                'cwd': 'node_modules/pixi.js/dist/',
                'src': ['pixi.min.*'],
                'dest': 'build/js/'
            },
            'app': {
                'expand': true,
                'nonull': true,
                'cwd': 'src/',
                'src': ['**'],
                'dest': 'build/'
            },
        },

        'replace': {
            'index_html': {
                'nonull': true,
                'src': 'build/index.html',
                'overwrite': true,
                'replacements': [{
                    'from': /(link data-res="font" href=)"[^"]*"/,
                    'to': '$1"fonts/fonts.css"'
                }, {
                    'from': /(script data-res="pixi" src=)"[^"]*"/,
                    'to': '$1"js/pixi.min.js"'
                }]
            }
        },
    });


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');


    grunt.registerTask('build_offline', 'Create an offline bundle', [
        'copy',
        'replace'
    ]);

    grunt.registerTask('default', [
        'build_offline'
    ]);
};
