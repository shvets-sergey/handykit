# Handykit Backbone.js TodoMVC Example

This is a TodoMVC Backbone example that have been rewritten with using Handykit wrapper and added AMD approach
to here. Use this code if you're about to build a big project and stick to one file is not your option.

For AMD approach _[require.js](http://requirejs.org/) was used.
In order to have JSX transformer running with requirejs during development _[jsx-require-plugin](https://github.com/philix/jsx-requirejs-plugin)
was used.

For example of how to get build and optimize code for production see bash script and its comments in build_production.sh.
Tools used to optimize is r.js optimizer and react-tools for npm. Output is in the built folder, so you can run and play
with it. During optimization jsx plugin and JSX-Optimizer were cut off from the output file.

Original code is here: _[TodoMVC example Backbone](https://github.com/tastejs/todomvc/tree/gh-pages/architecture-examples/backbone)_
