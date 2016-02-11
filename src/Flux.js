const ActionManager = require('./ActionManager');
const DispatchKey = require('./DispatchKey');
const DispatchManager = require('./DispatchManager');
const Store = require('./Store');
const StoreManager = require('./StoreManager');
const Template = require('./Template');
const templates = require('./templates/*', {mode: 'hash'})

/**
 * Lightweight flux implementation. Design goal is to create a framework that's
 * extensible while remaining as simple as possible to use.
 */
class Flux {
  /**
   * Creates a flux instance.
   */
  constructor() {
    this._storeManager = new StoreManager(this);
    this._actionManager = new ActionManager(this);
    this._dispatchManager = new DispatchManager(this);
  };

  /**
   * Retrieves actions based on a qualifier, where the qualifier is either
   * an action group or store name.
   *
   * *Example:*
   * ```javascript
   * // Create a store.
   * flux.createStore('MyStore', { increment: function() {} });
   *
   * // Access actions from that store.
   * flux.actions('MyStore').increment();
   * ```
   * @param {string} qualifier Either or an action group or store name.
   * @return {Object.<string, Function>} A map of action methods that can be
   *                                     called directly with a payload.
   */
  actions(qualifier) {
    return this._actionManager.findActions(qualifier);
  };

  /**
   * Helper method for actions that adds arbitrary contextual data to a dispatch
   * when an action executes.
   *
   * *Example:*
   * ```javascript
   * // Create a store with an event that listens for contextual data.
   * flux.createStore('MyStore', {
   *   update: flux.listenTo({mode: 'addition'}, function(payload) {
   *     // Add 'payload' to some state value.
   *   });
   * });
   *
   * // Create a custom action that invokes a dispatch with contextual data.
   * flux.createActions('MyActions', function() {
   *   add: flux.actionWithContext('update', {mode: 'addition'}, function() {
   *     return 5;
   *   });
   * });
   * ```
   * @param {string} key Reference to key specified in store.
   * @param {Object.<string, string|number>} context Qualifying parameters for action context.
   * @param {Function} callback Action body or logic.
   * @return {Function} Proxy method that updates callback dispatch to include
   *                    contextual data.
   */
  actionWithContext(key, context, callback) {
    return this._actionManager.actionWithContext(key, context, callback);
  };

  /**
   * Entry point for creating a group of actions.
   *
   * *Example:*
   * ```javascript
   * // Create a custom action.
   * flux.createActions('MyActions', function() {
   *   addValue: function(payload) {
   *     return payload;
   *   });
   * });
   *
   * // Invoke the action 'addValue'.
   * flux.actions('MyActions').addValue(5);
   * ```
   * @param {string} group Identifier for the set of actions.
   * @param {Object.<string, Function>} actions The set of actions.
   */
  createActions(group, actions) {
    this._actionManager.initCustomActions(group, actions);
  };

  /**
   * Entry point for creating a store.
   *
   * *Example:*
   * ```javascript
   * // Create a store with an event that listens for contextual data.
   * flux.createStore('MyStore', {
   *   initialize: function() {
   *     return {
   *       value: 0
   *     };
   *   },
   *   increment: function(payload) {
   *     this.set('value', this.state.value + payload);
   *   }
   * });
   * ```
   * @param {string} name The name to use when identifying the store.
   * @param {Object.<string, Function>} definition The specification for the store containing
   *                            events and configurations.
   */
  createStore(name, definition) {
    this._storeManager.createStore(name, definition);
    this._actionManager.initStoreActions(name);
    this._dispatchManager.registerStoreCallback(name);
  };

  /**
   * Uses a template in a store. Templates make it easier to define store
   * behavior by applying custom logic to an event.
   *
   * *Example:*
   * ```javascript
   * // Create backbone model that Flux.Ajax can utilize for making web requests.
   * var Accounts = Backbone.Model.extend({
   *   setUrl: function() {
   *     this.url = 'getAccounts';
   *   }
   * });
   *
   * // Create a store that uses the Flux.Ajax template. This template can be
   * // used to perform GET and POST requests.
   * flux.createStore('MyStore', {
   *   searchAccounts: flux.createTemplate(Flux.Ajax, {
   *     // Use the backbone model defined above.
   *     model: Accounts,
   *     // Event hooks for applying additonal custom behavior.
   *     onInit: function() {},
   *     onSuccess: function(payload) {
   *       // When request sucessfully completes, can perform custom logic.
   *       console.log(payload);
   *     },
   *     onFail: function(payload) {
   *       // When request fails to complete, can perform custom logic.
   *       console.log(payload);
   *     }
   *   })
   * });
   *
   * // The store maintains an internal state for the template that is
   * // structured within the store like this:
   * > console.log(this.state.searchAccounts)
   * {
   *   model: Accounts,
   *   status: ACTION.UNINITIALIZED,
   *   error: null,
   *   errorType: null
   * }
   *
   * // The template state can then be retrieved in a React component.
   * React.createClass({
   *   // Tells the compenont to which stores it should listen.
   *   mixins: [flux.setStores('MyStore')],
   *
   *   // We manage the state of the component. Parameter 'states' is an
   *   // object containing the state of each store to which the component is
   *   // listening.
   *   syncStores: function(states) {
   *     console.log(states.MyStore.searchAccounts);
   *     this.setState(states);
   *   },
   *
   *   render: function() {
   *     return null;
   *   }
   * }
   * ```
   * @param {Template} template A subclass of Template definining the logic of
   *                            the template.
   * @param {Object} definition Templates expose hooks that allow for
   *                            customization. See template for outline of
   *                            available hooks.
   * @return {Template} An instantiated instance of the template.
   */
  createTemplate(template, definition) {
    return Template.create(template, definition);
  };

  /** Dispatch an event from an action that stores listen to and consume.
    *
    * *Example:*
    * ```javascript
    * // Create a custom action and then use 'this.dispatch' to asynchronously
    * // invoke a custom action.
    * flux.createActions('MyActions', function() {
    *   // Sometimes it makes sense to asynchronously invoke a dispatch. In this
    *   // situation use this.dispatch to invoke the dispatch.
    *   delayAdd: function(payload) {
    *     setTimeout(function() {
    *       // Using what's exposed on the method context.
    *       this.dispatch('addValue', payload);
    *       // Using Flux directly.
    *       Flux.dispatch(new DispatchKey('MyActions', payload));
    *     }, 2000);
    *   }
    * });
    *
    * // Invoke the action 'delayValue'.
    * flux.actions('MyActions').delayValue(5);
    * ```
    * @param {DispatchKey} dispatchKey The dispatch identifier.
    * @param {any} data Dispatch payload that is often an {Object}.
    */
  dispatch(dispatchKey, data) {
    this._dispatchManager.dispatch(dispatchKey, data);
  };

  /**
   * Retrieves the state of a store by name.
   *
   * *Example:*
   * ```javascript
   * // Create a store.
   * flux.createStore('MyStore', {
   *   // Access another store and use that data in this store.
   *   copyValue() {
   *     var copy = flux.getStore('SecondaryStore').secondaryValue;
   *     ...
   *   }
   * });
   * ```
   * @param {string} name The name of the store.
   * @return {Object} The state of the store.
   */
  getStore(name) {
    return StoreManager.getStoreState(name, this._storeManager._stores);
  };

  /**
   * Helper method for stores used for filtering dispatches by context.
   *
   * *Example:*
   * ```javascript
   * // Create a store with an event that listens for contextual data.
   * flux.createStore('MyStore', {
   *   update: flux.listenTo({mode: 'addition'}, function(payload) {
   *     // Add 'payload' to some state value.
   *   });
   * });
   *
   * // Create a custom action that invokes a dispatch with contextual data.
   * flux.createActions('MyActions', function() {
   *   add: flux.actionWithContext('update', {mode: 'addition'}, function() {
   *     return 5;
   *   });
   * });
   * ```
   * @param {Object.<string, string|number>} context The context by which the
   *                                         event should be filtered.
   * @param {Function} callback Method to execute if context matches the
   *                            context of the dispatch.
   * @return {Function} Proxy for callback that implements context filtering.
   */
  listenTo(context, callback) {
    return DispatchKey.withContext(context, callback);
  };

  /**
   * Helper utility enabling components to listen to updates from stores by
   * returning React mixin that's added to the component.
   *
   * *Example:*
   * ```javascript
   * // Create React component and then set a store on the component.
   * React.createClass({
   *   // Tells the compenont to which stores it should listen.
   *   mixins: [flux.setStores('MyStore')],
   *
   *   syncStores: function(states) {
   *     ...
   *   },
   *
   *   render: function() {
   *     ...
   *   }
   * }
   * ```
   * @param {Array.<string>} args A list of store names.
   * @return {Object.<string, Function>} Store hooks for react components.
   */
  setStores(...args){
    return StoreManager.setStoreMixin(this._storeManager.stores)(...args);
  };
}

// Add templates as static objects to Flux namespace.
for (let i in templates) {
  Flux[i] = templates[i];
}

global.Flux = Flux;
