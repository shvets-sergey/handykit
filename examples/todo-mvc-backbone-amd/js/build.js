/**
 * Build file config for optimization. With this config, your code will be gathered
 * all togethered in one file and you will be able to use all the benefits of AMD approach
 * for development with speed of bundled file for production.
 *
 * See more details over here: http://requirejs.org/docs/optimization.html
 * Author: bearz
 */
({
    baseUrl: '.',
    mainConfigFile: 'app.js',
    optimize: "none",
    useStrict: true,
    dir: '../webapp-build',
    preserveLicenseComments: false,
    onBuildWrite: function (moduleName, path, singleContents) {
        return singleContents.replace(/jsx!/g, '');
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        react: {
            exports: 'React'
        },
        handykit: {
            deps: ['backbone', 'react'],
            exports: 'Handykit'
        },
        enforceDefine: true
    },
    modules: [
        {
            name: "app",
            exclude: ["jsx"]
        }
    ]
})