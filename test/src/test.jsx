
let createStores = function(flux) {

  // Models require node server to be running in order to serve responses to
  // the AJAX requests correctly.
  const TestSuccessModel = Backbone.Model.extend({
    setUrl: function() {
      this.url = 'success';
    },
    defaults: { data1: null, data2: null, data3: null }
  });

  const TestFailModel = Backbone.Model.extend({
    setUrl: function() {
      this.url = 'fail';
    }
  });

  const TestPostModel = Backbone.Model.extend({
    setUrl: function() {
      this.url = 'post';
    },
    defaults: { data1: null, data2: null, data3: null }
  });

  const TestTimeoutModel = Backbone.Model.extend({
    setUrl: function() {
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
    initialize() {
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
    addValue(payload) {
      this.set('incrementValueTest', this.state.incrementValueTest + payload);
    },

    // Actions can initiate dispatches with contextual data. This tells the
    // store to listen for specific contextual data.
    addValue2: flux.listenTo({test: 'test'}, function(payload) {
      this.set('incrementValueTest', this.state.incrementValueTest + payload);
    }),

    // Can define multiple listeners to capture different context states simply
    // by chaining listeners in an array.
    saveChoice: [
      flux.listenTo({status: 'FAIL'}, function(payload) {
        this.set('saveChoiceTest', payload);
      }),
      flux.listenTo({status: 'SUCCESS'}, function(payload) {
        this.set('saveChoiceTest', payload);
      })
    ],

    // Creating a template using a template implementation.
    searchSuccess: flux.createTemplate(Flux.Ajax, {
      model: TestSuccessModel,
      // Event hooks for applying additonal custom behavior.
      onInit() {
        console.log(this);
      },
      onSuccess(payload) {
        console.log(payload);
      },
      onFail(payload) {
        console.log(payload);
      }
    }),

    searchFail: flux.createTemplate(Flux.Ajax, {
      model: TestFailModel,
      onSuccess(payload) {
        console.log(payload);
      },
      onFail(payload) {
        console.log(payload);
      }
    }),

    searchPost: flux.createTemplate(Flux.Ajax, {
      model: TestPostModel,
      onSuccess(payload) {
        console.log(payload);
      },
      onFail(payload) {
        console.log(payload);
      }
    }),

    searchTimeout: flux.createTemplate(Flux.Ajax, {
      model: TestTimeoutModel,
      onSuccess(payload) {
        console.log(payload);
      },
      onFail(payload) {
        console.log(payload);
      }
    }),

    // Listening on addSecondaryValue event defined in SecondayStore.
    addSecondaryValue(payload) {
      this.set('incrementValueTest', this.state.incrementValueTest + payload);
    },

    // You can access another store and use that data in this store.
    copyValue() {
      const copy = flux.getStore('SecondaryStore').secondaryValue;
      this.set('copyValueTest', copy);
    }

  });

  // We need to be able to do two things.
  // 1. Listen for events from here with ExampleStore.
  // 2. Get store state from ExampleStore.
  flux.createStore('SecondaryStore', {
    initialize() {
      return {
        secondaryValue: 1000
      };
    },
    addSecondaryValue(payload) {
      this.set('secondaryValue',this.state.secondaryValue + payload);
    }
  });
}

const createActions = function(flux) {
  // Define custom actions and then tell stores they can listen to their
  // dispatches.
  flux.createActions('CustomActions', {
    // Simply returning the payload will immediately invoke a dispatch.
    addValue: function(payload) {
      return payload;
    },
    // Sometimes it makes sense to asynchronously invoke a dispatch. In this
    // situation use this.dispatch to invoke the dispatch.
    delayAdd: function(payload) {
      setTimeout(() => {
        this.dispatch('addValue', payload);
      }, 1000);
      setTimeout(() => {
        // Dispatch with or without contextual data.
        this.dispatch('addValue2', {test: 'test'}, payload);
      }, 2000);
    },
    // Dispatch synchronously with different contexts.
    saveChoice: flux.actionWithContext('saveChoice', {status: 'SUCCESS'}, function() {
      return "Some choice.";
    }),
    saveChoiceTimeout: flux.actionWithContext('saveChoice', {status: 'TIMEOUT'}, function() {
      return "I'll do nothing as there's no corresponding store event.";
    })
  });
}

/** Lots of ways to put flux into the scope of the component.
  * For this example, this is the easiest. */
const ExampleComponent = function(flux) {
  return  React.createClass({
    // Tells the compenont to which stores it should listen.
    mixins: [flux.setStores('ExampleStore', 'SecondaryStore')],

    // We need to manage the state of the component. Parameter 'states' is an
    // object containing the state of each store to which the component is
    // listening.
    syncStores(states) {
      this.setState(states);
    },

    // Invoke an action from the component. Method flux.actions accepts
    // the name of the action group or store name.
    incrementHandler() {
      flux.actions('CustomActions').addValue(2);
    },

    delayHandler() {
      flux.actions('CustomActions').delayAdd(3);
    },

    ajaxSuccessHandler() {
      flux.actions('ExampleStore').searchSuccessGet();
    },

    ajaxFailHandler() {
      flux.actions('ExampleStore').searchFailGet();
    },

    ajaxPostHandler() {
      flux.actions('ExampleStore').searchPostPost();
    },

    ajaxTimeoutHandler() {
      flux.actions('ExampleStore').searchTimeoutPost();
    },

    saveChoiceHandler() {
      flux.actions('CustomActions').saveChoice(3);
    },

    incrementSecondaryHandler() {
      flux.actions('SecondaryStore').addSecondaryValue(5);
    },

    copyValueHandler() {
      flux.actions('ExampleStore').copyValue();
    },

    componentDidMount() {
      flux.actions('ExampleStore').searchSuccessInit();
      flux.actions('ExampleStore').searchFailInit();
      flux.actions('ExampleStore').searchPostInit();
      flux.actions('ExampleStore').searchTimeoutInit();
    },

    render() {
      return (
        <div>
          <h2>Test script for Flux implementation.</h2>
          <ol>
            <li>
              <p>Test: loading data from store. Should see message.</p>
              {this.state.ExampleStore.storeLoadTest}
            </li>
            <li>
              <p>Test: setting value in store using store created action.</p>
              <div>
                <button onClick={this.saveChoiceHandler}>Save Choice</button>
                {this.state.ExampleStore.saveChoiceTest}
              </div>
            </li>
            <li>
              <p>Test: setting value in store using custom actions.</p>
              <div>
                Simple "return" action:
                <button onClick={this.incrementHandler}>Increment</button>
              </div>
              <div>
                Custom "this.dispatch" action:
                <button onClick={this.delayHandler}>Delay</button>
              </div>
              <p>
                Incremented Value: <b>{this.state.ExampleStore.incrementValueTest}</b>
              </p>
            </li>
            <li>
              <p>
                Test: Template implementation using AJAX template. Should see
                store values updated based on responses.
              </p>
              <div>
                <button onClick={this.ajaxSuccessHandler}>Ajax GET Success</button>
                {
                  (this.state.ExampleStore.searchSuccess.model)
                    ? JSON.stringify(this.state.ExampleStore.searchSuccess.model.attributes)
                    : 'No data.'
                }
              </div>
              <div>
                <button onClick={this.ajaxFailHandler}>Ajax GET Fail</button>
                {
                  (this.state.ExampleStore.searchFail.error)
                    ? JSON.stringify(this.state.ExampleStore.searchFail.error)
                    : 'No data.'
                }
              </div>
              <div>
                <button onClick={this.ajaxPostHandler}>Ajax POST Success</button>
                {
                  (this.state.ExampleStore.searchPost.model)
                    ? JSON.stringify(this.state.ExampleStore.searchPost.model.attributes)
                    : 'No data.'
                }
              </div>
              <p><b>
                Easiest way to test timeout is to set jQuery timeout in Ajax.js.
              </b></p>
              <div>
                <button onClick={this.ajaxTimeoutHandler}>Ajax Timeout</button>
                {
                  (this.state.ExampleStore.searchTimeout.error)
                    ? this.state.ExampleStore.searchTimeout.error
                    : 'No data.'
                }
              </div>
            </li>
            <li>
              <p>
                Test: setting and retrieving data from primary/secondary stores.
              </p>
              <p>
                Incremented value in secondary store. Primary store is also listening
                for event and incrementing value you can see above.
              </p>
              <div>
                <button onClick={this.incrementSecondaryHandler}>Increment Value for Secondary</button>
                {this.state.SecondaryStore.secondaryValue}
              </div>
              <p>
                Using primary store, access value from secondary store and copy to primary store.
              </p>
              <div>
                <button onClick={this.copyValueHandler}>Copy from secondary to primary.</button>
                {this.state.ExampleStore.copyValueTest}
              </div>
            </li>
          </ol>
        </div>
      );
    }
  });
}
