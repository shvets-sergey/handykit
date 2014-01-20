define(['backbone', 'presenters/todo-presenter'], function(Backbone, TodoPresenter) {

    var TodoRouter = Backbone.Router.extend({
        routes: {
            '*filter': 'setFilter'
        },

        setFilter: function (param) {
            // Set the current filter to be used
            var curFilter = param || 'all';
            app.TodoPresenter.setSelectedFilter(curFilter);
        }
    });

    var TodoRouter = new TodoRouter();
    Backbone.history.start();

    return TodoRouter;
});

