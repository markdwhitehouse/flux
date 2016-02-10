'use strict';

var createStores = function createStores(flux) {

  // Models require node server to be running in order to serve responses to
  // the AJAX requests correctly.
  var TestSuccessModel = Backbone.Model.extend({
    setUrl: function setUrl() {
      this.url = 'success';
    },
    defaults: { data1: null, data2: null, data3: null }
  });

  var TestFailModel = Backbone.Model.extend({
    setUrl: function setUrl() {
      this.url = 'fail';
    }
  });

  var TestPostModel = Backbone.Model.extend({
    setUrl: function setUrl() {
      this.url = 'post';
    },
    defaults: { data1: null, data2: null, data3: null }
  });

  var TestTimeoutModel = Backbone.Model.extend({
    setUrl: function setUrl() {
      this.url = 'timeout';
    },
    defaults: { data1: null, data2: null, data3: null }
  });

  // Create a store and store a reference internally to it as "ExampleStore".
  flux.createStore('ExampleStore', {

    // You can tell the store that it is able to listen to events from other
    // sources. In this case, a custom action group and a secondary store.
    // Both are defined below.
    actions: ['CustomActions', 'SecondaryStore'],

    // Initialize some store default values.
    initialize: function initialize() {
      return {
        storeLoadTest: 'Sucessfully loaded store!!!',
        incrementValueTest: 0,
        saveChoiceTest: 'No selection.',
        copyValueTest: 0
      };
    },


    // The simplest form of action. Automatically generates the corresponding
    // action that can be referenced in components like this:
    //   flux.actions('ExampleStore').addValue;
    addValue: function addValue(payload) {
      this.set('incrementValueTest', this.state.incrementValueTest + payload);
    },


    // Actions can initiate dispatches with contextual data. This tells the
    // store to listen for specific contextual data.
    addValue2: flux.listenTo({ test: 'test' }, function (payload) {
      this.set('incrementValueTest', this.state.incrementValueTest + payload);
    }),

    // Can define multiple listeners to capture different context states simply
    // by chaining listeners in an array.
    saveChoice: [flux.listenTo({ status: 'FAIL' }, function (payload) {
      this.set('saveChoiceTest', payload);
    }), flux.listenTo({ status: 'SUCCESS' }, function (payload) {
      this.set('saveChoiceTest', payload);
    })],

    // Creating a template using a template implementation.
    searchSuccess: flux.createTemplate(Flux.Ajax, {
      model: TestSuccessModel,
      // Event hooks for applying additonal custom behavior.
      onInit: function onInit() {
        console.log(this);
      },
      onSuccess: function onSuccess(payload) {
        console.log(payload);
      },
      onFail: function onFail(payload) {
        console.log(payload);
      }
    }),

    searchFail: flux.createTemplate(Flux.Ajax, {
      model: TestFailModel,
      onSuccess: function onSuccess(payload) {
        console.log(payload);
      },
      onFail: function onFail(payload) {
        console.log(payload);
      }
    }),

    searchPost: flux.createTemplate(Flux.Ajax, {
      model: TestPostModel,
      onSuccess: function onSuccess(payload) {
        console.log(payload);
      },
      onFail: function onFail(payload) {
        console.log(payload);
      }
    }),

    searchTimeout: flux.createTemplate(Flux.Ajax, {
      model: TestTimeoutModel,
      onSuccess: function onSuccess(payload) {
        console.log(payload);
      },
      onFail: function onFail(payload) {
        console.log(payload);
      }
    }),

    // Listening on addSecondaryValue event defined in SecondayStore.
    addSecondaryValue: function addSecondaryValue(payload) {
      this.set('incrementValueTest', this.state.incrementValueTest + payload);
    },


    // You can access another store and use that data in this store.
    copyValue: function copyValue() {
      var copy = flux.getStore('SecondaryStore').secondaryValue;
      this.set('copyValueTest', copy);
    }
  });

  // We need to be able to do two things.
  // 1. Listen for events from here with ExampleStore.
  // 2. Get store state from ExampleStore.
  flux.createStore('SecondaryStore', {
    initialize: function initialize() {
      return {
        secondaryValue: 1000
      };
    },
    addSecondaryValue: function addSecondaryValue(payload) {
      this.set('secondaryValue', this.state.secondaryValue + payload);
    }
  });
};

var createActions = function createActions(flux) {
  // Define custom actions and then tell stores they can listen to their
  // dispatches.
  flux.createActions('CustomActions', {
    // Simply returning the payload will immediately invoke a dispatch.
    addValue: function addValue(payload) {
      return payload;
    },
    // Sometimes it makes sense to asynchronously invoke a dispatch. In this
    // situation use this.dispatch to invoke the dispatch.
    delayAdd: function delayAdd(payload) {
      var _this = this;

      setTimeout(function () {
        _this.dispatch('addValue', payload);
      }, 1000);
      setTimeout(function () {
        // Dispatch with or without contextual data.
        _this.dispatch('addValue2', { test: 'test' }, payload);
      }, 2000);
    },
    // Dispatch synchronously with different contexts.
    saveChoice: flux.actionWithContext('saveChoice', { status: 'SUCCESS' }, function () {
      return "Some choice.";
    }),
    saveChoiceTimeout: flux.actionWithContext('saveChoice', { status: 'TIMEOUT' }, function () {
      return "I'll do nothing as there's no corresponding store event.";
    })
  });
};

/** Lots of ways to put flux into the scope of the component.
  * For this example, this is the easiest. */
var ExampleComponent = function ExampleComponent(flux) {
  return React.createClass({
    // Tells the compenont to which stores it should listen.
    mixins: [flux.setStores('ExampleStore', 'SecondaryStore')],

    // We need to manage the state of the component. Parameter 'states' is an
    // object containing the state of each store to which the component is
    // listening.
    syncStores: function syncStores(states) {
      this.setState(states);
    },


    // Invoke an action from the component. Method flux.actions accepts
    // the name of the action group or store name.
    incrementHandler: function incrementHandler() {
      flux.actions('CustomActions').addValue(2);
    },
    delayHandler: function delayHandler() {
      flux.actions('CustomActions').delayAdd(3);
    },
    ajaxSuccessHandler: function ajaxSuccessHandler() {
      flux.actions('ExampleStore').searchSuccessGet();
    },
    ajaxFailHandler: function ajaxFailHandler() {
      flux.actions('ExampleStore').searchFailGet();
    },
    ajaxPostHandler: function ajaxPostHandler() {
      flux.actions('ExampleStore').searchPostPost();
    },
    ajaxTimeoutHandler: function ajaxTimeoutHandler() {
      flux.actions('ExampleStore').searchTimeoutPost();
    },
    saveChoiceHandler: function saveChoiceHandler() {
      flux.actions('CustomActions').saveChoice(3);
    },
    incrementSecondaryHandler: function incrementSecondaryHandler() {
      flux.actions('SecondaryStore').addSecondaryValue(5);
    },
    copyValueHandler: function copyValueHandler() {
      flux.actions('ExampleStore').copyValue();
    },
    componentDidMount: function componentDidMount() {
      flux.actions('ExampleStore').searchSuccessInit();
      flux.actions('ExampleStore').searchFailInit();
      flux.actions('ExampleStore').searchPostInit();
      flux.actions('ExampleStore').searchTimeoutInit();
    },
    render: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          null,
          'Test script for Flux implementation.'
        ),
        React.createElement(
          'ol',
          null,
          React.createElement(
            'li',
            null,
            React.createElement(
              'p',
              null,
              'Test: loading data from store. Should see message.'
            ),
            this.state.ExampleStore.storeLoadTest
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'p',
              null,
              'Test: setting value in store using store created action.'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.saveChoiceHandler },
                'Save Choice'
              ),
              this.state.ExampleStore.saveChoiceTest
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'p',
              null,
              'Test: setting value in store using custom actions.'
            ),
            React.createElement(
              'div',
              null,
              'Simple "return" action:',
              React.createElement(
                'button',
                { onClick: this.incrementHandler },
                'Increment'
              )
            ),
            React.createElement(
              'div',
              null,
              'Custom "this.dispatch" action:',
              React.createElement(
                'button',
                { onClick: this.delayHandler },
                'Delay'
              )
            ),
            React.createElement(
              'p',
              null,
              'Incremented Value: ',
              React.createElement(
                'b',
                null,
                this.state.ExampleStore.incrementValueTest
              )
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'p',
              null,
              'Test: Template implementation using AJAX template. Should see store values updated based on responses.'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.ajaxSuccessHandler },
                'Ajax GET Success'
              ),
              this.state.ExampleStore.searchSuccess.model ? JSON.stringify(this.state.ExampleStore.searchSuccess.model.attributes) : 'No data.'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.ajaxFailHandler },
                'Ajax GET Fail'
              ),
              this.state.ExampleStore.searchFail.error ? JSON.stringify(this.state.ExampleStore.searchFail.error) : 'No data.'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.ajaxPostHandler },
                'Ajax POST Success'
              ),
              this.state.ExampleStore.searchPost.model ? JSON.stringify(this.state.ExampleStore.searchPost.model.attributes) : 'No data.'
            ),
            React.createElement(
              'p',
              null,
              React.createElement(
                'b',
                null,
                'Easiest way to test timeout is to set jQuery timeout in Ajax.js.'
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.ajaxTimeoutHandler },
                'Ajax Timeout'
              ),
              this.state.ExampleStore.searchTimeout.error ? this.state.ExampleStore.searchTimeout.error : 'No data.'
            )
          ),
          React.createElement(
            'li',
            null,
            React.createElement(
              'p',
              null,
              'Test: setting and retrieving data from primary/secondary stores.'
            ),
            React.createElement(
              'p',
              null,
              'Incremented value in secondary store. Primary store is also listening for event and incrementing value you can see above.'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.incrementSecondaryHandler },
                'Increment Value for Secondary'
              ),
              this.state.SecondaryStore.secondaryValue
            ),
            React.createElement(
              'p',
              null,
              'Using primary store, access value from secondary store and copy to primary store.'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'button',
                { onClick: this.copyValueHandler },
                'Copy from secondary to primary.'
              ),
              this.state.ExampleStore.copyValueTest
            )
          )
        )
      );
    }
  });
};