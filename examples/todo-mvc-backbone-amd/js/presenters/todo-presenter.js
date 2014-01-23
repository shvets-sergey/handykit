/* GLOBAL Handykit, jQuery */
define(['handykit', 'collections/todos'], function(Handykit, todoCollection) {
    var TodoPresenter = Handykit.Presenter.extend({
        selectedFilter: 'all',
        initialize: function() {
            _.bindAll(this, 'createTodo', 'clearCompleted', 'bulkMarkAll', 'toggleTodo',
                'deleteTodo', 'updateTodo'); // TODO autobinding for presenter
            this.collection.fetch({reset: true});
        },
        getSelectedFilter: function() {
            return this.selectedFilter;
        },
        setSelectedFilter: function(filter) {
            this.selectedFilter = filter;
            this.updateDOM(null);
        },
        getTodos: function() {
            // simple stub for now
            if (this.selectedFilter === 'all') {
                return this.collection.models;
            } else if (this.selectedFilter === 'completed') {
                return this.collection.completed();
            } else if (this.selectedFilter === 'active') {
                return this.collection.remaining();
            }
        },
        createTodo: function(title, completed) {
            var completed = completed || false;
            var col = this.collection;
            col.create({
                title: title,
                order: col.nextOrder(),
                completed: completed
            });
            this.updateDOM(null); // immediate trigger update of DOM
        },
        clearCompleted: function() {
            _.invoke(this.collection.completed(), 'destroy');
            this.updateDOM(null);
        },
        bulkMarkAll: function(completed) {
            this.collection.each(function (todo) {
                todo.save({
                    'completed': completed
                });
            });
            this.updateDOM(null);
        },
        toggleTodo: function(todo_id) {
            var model = this.collection.get(todo_id);
            model.toggle();
            this.updateDOM(null);
        },
        deleteTodo: function(todo_id) {
            var model = this.collection.get(todo_id);
            model.destroy();
            this.updateDOM(null);
        },
        updateTodo: function(todo_id, updated_obj) {
            var model = this.collection.get(todo_id);
            model.save(updated_obj);
            this.updateDOM(null);
        }
    });

    return new TodoPresenter({collection: todoCollection});
});
