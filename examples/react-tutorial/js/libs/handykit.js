/**
 * Wrapper around Backbone (http://backbonejs.org/) and React (http://facebook.github.io/react/) libraries
 * that adds MVP pattern to this two great libraries.
 * Author: bearz (Sergey Shvets)
 */
(function() {

    // save the reference to the global object for future use
    var root = this; // exports for node.js, 'window' for browser

    var Handykit = root.Handykit = {}; // create root variable for library and export it to the 'window' namespace.
    Handykit.VERSION = 'alpha';
    // TODO put noConflict mode
    // TODO add r.js and other AMD compliance
    // TODO phonegap binding for mobile development + smart agentDetect for appropriate devices
    // TODO think more about singletons presenters. Removing this limitation leads to some memory consum

    // set of libraries dependencies that used in the library
    var Backbone = root.Backbone;
    var React = root.React;
    var _ = root._;
    // put here all the other libraries that we depend on.

    var Model = Handykit.Model = Backbone.Model.extend({
        /**
         * Represents a relational model inside the model.
         * You should provide server-side key here and model that we expect from server here.
         * Example:
         * Server side sends layer under "layer" key and inside the layer model object.
         * Than we must specify:
         * "layer" : LayerModel
         *
         * After this - it will be transformed automatically to model while response parsing.
         */
        relationMap: {},
        /**
         * Sync function accepts by default following arguments: method, model, options. \
         * Inside options we are able to pass beforeSend argument in order to add custom headers
         * needed for authorization. We will wrap this up in this function.
         */
        sync: function() {
            var request_options = null;
            // get existing options if they passed
            if (arguments.length === 3) { // fallback if at some time options argument will not be passed.
                request_options = arguments[2];
            } else {
                request_options = {};
            }

            // save beforeSend to the temp variable to extend function
            var beforeSend = request_options.beforeSend;
            request_options.beforeSend = function(xhr) {
                if (Handykit.auth) Handykit.auth(xhr); // function to add needed headers to Model
                if (beforeSend) return beforeSend.apply(this, arguments);
            };

            // call backbone model super method
            Backbone.Model.prototype.sync.apply(this, arguments);
        },
        /**
         * Extension of parse function.
         * Will add unserialize function to the class
         * and you can override it if you need.
         * mapRelation will also be added into the model,
         * and will be used for unserialize.
         */
        parse: function(resp, xhr) {
            return this.unserialize(resp);
        },
        unserialize: function(resp) {
            var resultMap = {};
            var key;
            // TODO REST approach if server only sends id of object (option for force fetch?)
            for ( key in resp ) {

                if (this.relationMap.hasOwnProperty(key) ) {
                    // get class of model from the relation map

                    var model = this.relationMap[key];
                    var value = null;
                    if (model instanceof Array) {
                        try {
                            value = [];
                            for (var i = 0; i < resp[key].length; i++) {
                                value.push(new model[0](resp[key][i])); // adding every model and resp
                            }
                            resultMap[key] = value;
                        } catch(err) {
                            throw "Expected array or you specified not an instance of Handykit.Model"
                        }
                    } else {
                        // create a model instanse
                        try {
                            if (resp[key]) {
                                value = new model(resp[key]);
                            }
                            resultMap[key] = value;
                        } catch(err) {
                            throw "Expected instance of Handykit.Model inside a relationMap but got something else instead";
                        }
                    }

                } else {
                    // simply process the value to the set array
                    resultMap[key] = resp[key];
                }
            }

            return resultMap;
        }
    });

    var Collection = Handykit.Collection = Backbone.Collection.extend({
        // TODO add parsing pagination
        /**
         * Key where we expect to has an array with Models
         */
        objectsKey : "resources",
        /**
         * Custom parsing function
         * @param resp
         * @param xhr
         * @returns {*}
         */
        parse: function(resp, xhr) {
            if (resp instanceof Array) {
                // Backbone knows how to handle an array responses, let's trust it at this
                return resp;
            } else {
                // let's handle custom case where there are no more
                // array but some custom array.
                // We are handle pagination and objects base on other functions specified above
                return this.handleModelResponse(resp);
            }
        },
        /**
         * Will parse response from custom dict using
         * pagination + objectsKey variables
         */
        handleModelResponse: function(resp) {
            // obtain objects list from response
            if (resp.hasOwnProperty(this.objectsKey)) {
                return resp[this.objectsKey];
            }
        },
        /**
         * Sync function accepts by default following arguments: method, model, options. \
         * Inside options we are able to pass beforeSend argument in order to add custom headers
         * needed for authorization. We will wrap this up in this function.
         */
        sync: function() {
            var request_options = null;
            // get existing options if they passed
            if (arguments.length === 3) { // fallback if at some time options argument will not be passed.
                request_options = arguments[2];
            } else {
                request_options = {};
            }

            // save beforeSend to the temp variable to extend function
            // Don't use SessionController here, in order to avoid circular imports
            var beforeSend = request_options.beforeSend;
            request_options.beforeSend = function(xhr) {
                if (Handykit.auth) Handykit.auth(xhr);
                if (beforeSend) return beforeSend.apply(this, arguments);
            };

            // call backbone model super method
            Backbone.Collection.prototype.sync.apply(this, arguments);
        }
    });

    /**
     * Function to detect the correct view you want to show for user. It will return
     * string name of function that need to be called for render and you can put all this logic
     * into your view.
     * @returns {string}
     *      name of function to call inside the Handykit.View
     */
    Handykit.agentDetect = function() {
        var browserWidth = window.innerWidth;
        // based on bootstrap grid layout by default.
        if (browserWidth < 768) {
            return 'renderXS';
        } else if (browserWidth >= 768 && browserWidth < 992) {
            return 'renderSM';
        } else if (browserWidth >= 992 && browserWidth < 1200) {
            return 'renderMD';
        } else if (browserWidth > 1200) {
            return 'renderLG';
        }

        throw 'Unsupported browser size. Check that "window.innerWidth" returns integer.'
    };

    /**
     * Base class that adding responsiveness and presenterName functionality to React base views.
     *
     * @type {{render: Function}}
     */
    var HandykitReactBase = {
        render: function() {
            var renderFunc = this[Handykit.agentDetect()] || this.renderLG; // TODO update fallback to be more smart
            return renderFunc(); // get appropriate function and call it.
        },
        /**
         * Wraps react's ComponentWillMount function and check for 'presenterName' property inside
         * the views props. If presenter exists then it grabs an instance from Core component and
         * inject it to the view into 'presenter' property.
         */
        componentWillMount: function() {
            if (this.props.presenterName) {
                this.presenter = _Core._getPresenter(this.props.presenterName);
            }
            this._componentWillMountNative && this._componentWillMountNative();
        },
        shouldComponentUpdate: function(nextProps, nextState) {
            if (this.presenter) {
                return this.presenter.shouldComponentUpdate();
            }

            return true; // update if this function is still here.
        }
        // put here any common options for the React Views in Handykit.
    };

    /**
     * Handy wrapper around the 'React.createClass' that makes presenterName bindings and responsive design working.
     * @type {Function}
     */
    var View = Handykit.View = function(reactView) {
        if (_.has(reactView, "componentWillMount")) {
            reactView['_componentWillMountNative'] = reactView.componentWillMount;
            delete reactView.componentWillMount; // delete function
        }
        var classToCreate = _.extend(_.clone(HandykitReactBase), reactView); // merge HandykitReactBase with view
        return React.createClass(classToCreate);
    };

    /**
     * Shared bus object. Use Backbone.Events system for eventBus implementation.
     * @type {*}
     * @private
     */
    var _eventBus = _.extend({}, Backbone.Events);

    /**
     * Link to the _Core object. This object will be created during invoking start function.
     * @type {Core}
     * @private
     */
    var _Core = null;
    var _tmp_presenters = []; // array for presenters that created before Core initialized
    /**
     * Core class for the Handykit which connects pieces together.
     * @param rootComponent
     *      View component that will be holding all DOM. You can't put any presenters here. This is artificial limitation
     *      and can be changed.
     * @param rootEl
     *      DOM.el where it must be render. Either string id of element or element itself (e.g. document.body)
     */
    var Core = function(rootComponent, rootEl) {
        this._presenters = {};
        this._eventBus = _eventBus;
        this._rootComponent = rootComponent;
        this._rootEl = rootEl;
        this._eventBus.on("__forceDOMUpdate", function(props) {
            this.updateUI(props);
        }, this);

        /**
         * Returns presenter from registered in Core. Makes sure that we don't
         * have multiple instances of one presenter. This can change in future if use cases for multiple
         * presenters will be provided.
         * TODO think about getting name from prototype.
         * @param name
         *      name of presenter from 'name' attribute.
         * @returns {*}
         * @private
         */
        this._getPresenter = function(name) {
            if (_.has(this._presenters, name)) {
                return this._presenters[name];
            } else {
                throw "No presenter with name '" + name + "' registered";
            }
        };

        /**
         * Registers presenter inside the Core component. It keeps only one instance of
         * presenter, since we assume that presenters will be singletons. It can change in future.
         * @param presenter
         *      Presenter object for creation.
         * @returns {Presenter}
         * @private
         */
        this._registerPresenter = function(presenter) {
            var name = presenter.name;
            if (!name) {
                throw "Presenter must have 'name' argument!";
            }

            this._presenters[name] = presenter;
            return presenter;
        };

        /**
         * Core function that trigger root component update. We rely on "reactiveness" of react, so just trigger
         * whole DOM update.
         * @param props
         *      props to be passed to rootComponent.
         */
        this.updateUI = function(props) {
            props || (props = {});
            React.renderComponent(this._rootComponent(props), this._rootEl);
        };

        return this;
    };

    var presenterOptions = ['model', 'collection', 'events']; // put here any common presenter options

    /**
     * Presenter is a core functionality of this framework. Main idea that presenters maintain data state inside of
     * it and as soon as data is ready triggers full DOM update relying on React to make it fast. There must be no DOM
     * manipulation in presenter - give it to React. This is done to ensure high decoupling and less states for the system.
     *
     * Two main functions:
     * - updateDOM - forces update of the DOM for ALL components depends of data state.
     * - 'events' property - a way to listen to some eventName. It uses Backbone event system, so presenter will
     * get basic backbone events + listen to the events triggered by other presenters.
     *
     * For now only 'trigger' and 'on' functions exposed to the PresenterAPI. More Events support will be added
     * in later updates according to use cases.
     * @type {Function}
     */
    var Presenter = Handykit.Presenter = function(options) {
        options || (options = {});
        _.extend(this, _.pick(options, presenterOptions), {_eventBus: _eventBus});
        this.initialize && this.initialize.apply(this, arguments);

        /**
         * Triggers event to the eventBus. All other presenters who signed for this
         * eventName will receive it and process accordingly.
         * @param name
         *      name of the event
         * Put other attributes after name.
         */
        this.trigger = function(name) {
            return this._eventBus.trigger.apply(this._eventBus, arguments);
        };

        /**
         * Signs presenter to listen to the event with name 'name'. Will automatically bind context of the event
         * to the current presenter.
         * @param name
         *      Name of the event to listen. Any string. Use of Backbone naming conventions recommended.
         * @param callback
         *      function to be called when this event occurs.
         * @returns {*}
         */
        this.on = function(name, callback) {
            return this._eventBus.on(name, callback, this);
        };

        /**
         * Function that triggers whole DOM update. React doing this really fast.
         * @param props
         *      props to be passed to the react base view.
         */
        this.updateDOM = function(props) {
            this.trigger('__forceDOMUpdate', props);
        };

        if (!this.shouldComponentUpdate) {
            this.shouldComponentUpdate = function() {
                return true; // we expect to always have this function in presenter for React.
            }
        }

        // handle register of presenter
        if (_Core) {
            _Core._registerPresenter(this);
        } else {
            _tmp_presenters.push(this);
        }

        // bind presenters events
        if (this.events) {
            for (var eventName in this.events) {
                var cb = this[this.events[eventName]];
                this.on(eventName, cb);
            }
        }
    };

    /**
     * Function that must be called in order to handykit start working.
     * It binds presenters to the Core component and setup "react-ify" updates.
     * Params are the same for the react component
     * @param rootComponent
     *      react component to be
     * @param rootElement
     */
    Handykit.start = function(rootComponent, rootElement ) {
        _Core = new Core(rootComponent, rootElement);

        for (var i=0; i < _tmp_presenters.length; i++) {
            _Core._registerPresenter(_tmp_presenters[i]);
        }
        _tmp_presenters = []; // handy way to clean array
        _Core.updateUI();
    };

    // Set up inheritance for the model, collection, router, view and history -
    // for consistency we go with backbone one.
    View.extend = Collection.extend = Presenter.extend = Model.extend = Backbone.View.extend;

    // If somebody wants to be responsive
    // I think having react is a great addition to responsive design.
    Handykit.enableResponsiveFeatures = function() {
        var resizeHandler = function() {
            _Core.updateUI();
        };
        var timer = null;
        window.addEventListener('resize', function(event) {
            clearTimeout(timer);
            timer = setTimeout(resizeHandler, 100);
        });
    };
}).call(this);
