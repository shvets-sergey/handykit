handykit
========

Wrapper around Backbone and React libraries that adds MVP pattern to this cocktail.

**This code is not yet tested well and in the raw state - use it on your own risk**

If you have any questions, suggestions and especially critics - feel free to contact me or create an issue.

Philosophy
==========

The goal of the library is to use best parts of the React.js and Backbone.js (and stay as close as possible to their implementations), add MVP pattern (http://www.youtube.com/watch?v=PDuhR18-EdM) and few other "handy" tools in order for developers to concentrate on their application logic. 

*Main idea*:
Library uses Backbone for manage data and application state (Models and Collections + Routes - "M" part). Based on the Backbone.Events system provides presenters functionality ("P" part). Use React.js for the "V" part. There are no direct connection from presenter to view. Presenters injected to the react views using special 'presenterName' attribute and view can get data from presenter through special attributes (not yet enforced!) as well as call presenter functions to process some user events. Whenever presenter needs to update UI - it makes sure that data is in up-to-date state and ask Handykit to trigger whole DOM update. Thanks to the reactive updates it must be fast and aligned with main React idea.

Future work
===========

1. Write tests for the Core library 
2. Write more "pet-projects" to understand what is missing
3. Add phonegap bindings in order to make a tool for quick mobile prototyping.
