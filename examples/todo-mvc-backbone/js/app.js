/*global $ */
/*jshint unused:false */
var app = app || {};
var ENTER_KEY = 13;
var ESC_KEY = 27;

$(function () {
	'use strict';

    // kick things off by using Handykit.start
    Handykit.start(app.RootContainer, document.getElementById('content'));
});
