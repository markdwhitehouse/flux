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
   * @param {string} qualifier Either or an action group or store name.
   * @return {Object.<Function>} Action methods.
   */
  actions(qualifier) {
    return this._actionManager.findActions(qualifier);
  };

  /**
   * Helper method for actions that adds contextual data to dispatch
   * when action executes.
   * @param {string} key Reference to key specified in store.
   * @param {Object} context Qualifying parameters for action context.
   * @param {Function} callback Action body or logic.
   * @return {Function} Proxy method that updates callback dispatch.
   */
  actionWithContext(key, context, callback) {
    return this._actionManager.actionWithContext(key, context, callback);
  };

  /**
   * Entry point for creating a group of actions.
   * @param {string} group Identifier for the set of actions.
   * @param {Object} actions The set of actions.
   */
  createActions(group, actions) {
    this._actionManager.initCustomActions(group, actions);
  };

  /**
   * Entry point for creating a store.
   * @param {string} name The name to use when identifying the store.
   * @param {Object} definition The specification for the store containing
   *                            events and configurations.
   */
  createStore(name, definition) {
    this._storeManager.createStore(name, definition);
    this._actionManager.initStoreActions(name);
    this._dispatchManager.registerStoreCallback(name);
  };

  /**
   * Adds a template to a store. Templates make it easier to define store
   * behavior by applying custom logic to an event.
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

  /** Dispatch an event that stores listen to and consume.
    *
    * @param {DispatchKey} dispatchKey The dispatch identifier.
    * @param {any} data Dispatch payload that is often an {Object}.
    */
  dispatch(dispatchKey, data) {
    this._dispatchManager.dispatch(dispatchKey, data);
  };

  /**
   * Retrieves the state of a store by name.
   * @param {string} name The name of the store.
   * @return {Object} The state of the store.
   */
  getStore(name) {
    return StoreManager.getStoreState(name, this._storeManager._stores);
  };

  /**
   * Helper method for stores that filter dispatches by context.
   * @param {Object} context The context by which the event should be filtered.
   * @param {Function} callback Method to execute if context matches the
   *                            context of the dispatch.
   * @return {Function} Proxy for callback that implements context filtering.
   */
  listenTo(context, callback) {
    return DispatchKey.withContext(context, callback);
  };

  /**
   * Helper utility enabling components to listen to updates from stores.
   *
   * Gets used like:
   *   mixins: [app.setStores('MyStore')],
   *
   * @param {Array.<string>} args A list of store names.
   * @return {Object} Store hooks for react components.
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
