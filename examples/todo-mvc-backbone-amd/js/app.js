require.config({
    baseUrl: "/js/",
    paths: {
        'jquery': 'libs/jquery',
        'underscore': 'libs/underscore',
        'backbone': 'libs/backbone',
        'handykit': 'libs/handykit',
        'react': 'libs/react',
        'backbone-localStorage': 'libs/backbone.localStorage',
        'JSXTransformer': 'libs/jsx-transformer'
    },

    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'handykit': {
            deps: ['backbone', 'underscore', 'react'],
            exports: 'Handykit'
        },
        'backbone-localStorage': {
            deps: ['backbone', 'underscore']
        },
        enforceDefine: true
    }
});

// Presenter here is the dependency that need to be imported, but not used.
// TODO remove from this dependency (passing instances and remove magic?)
require(['handykit', 'presenters/todo-presenter', 'jsx!views/reactive-views'], function(Handykit, TodoPresenter, RootContainer) {
    // kick things off by using Handykit.start
    Handykit.start(RootContainer, document.getElementById('content'));
});
