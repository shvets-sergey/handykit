/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Router
	// ----------
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

	app.TodoRouter = new TodoRouter();
	Backbone.history.start();
})();
