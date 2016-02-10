const DispatchKey = require('./DispatchKey.js');
const EventEmitter = require('wolfy87-eventemitter');
const Template = require('./Template.js')

/**
 * Flux store class. Handles the lifcycle of store from receiving events
 * from dispatches to processing those events to emiting events to react
 * components when store state is modified.
 */
class Store extends EventEmitter {
  /**
   * Creates a store instance.
   * @param {Flux} flux An istance of Flux.
   * @param {string} name The name for the store.
   * @param {Object} definition The logic for the store.
   */
  constructor(flux, name, definition) {
    if (!flux || !name || !definition) {
      throw new Error('Store: requires paramaters flux, name, and definition.');
    }
    super();
    this._flux = flux;
    this._name = name;
    this._definition = definition;
    this._actions = [];
    this._mappings = {};
    this._state = {};
    this._templates = {};

    // Start by processing templates and normal mappings.
    this._initializeTemplatesAndMappings();

    // Run initialization.
    if (definition.initialize) {
      this._state = Object.assign(this._state, definition.initialize());
    }
  }

  /**
   * Retrieves state object.
   * @return {Object} The state of the store.
   */
  get state() {
    return Object.assign({}, this._state);
  };

  /**
   * Private method for initializing template behavior and simple
   * event mappings.
   */
  _initializeTemplatesAndMappings() {
    const def = this._definition;
    for (let key in def) {
      const value = def[key];
      if (value instanceof Template) {
        const template = value;
        template.store = this._name;
        template.identifier = key;
        template.initStore();
        template.initActions();
        template._storeHandlers['INIT'].call(this._getContext(), null, null, true);
        this._state[key] = template.state;
        this._templates[key] = template;
      } else if (key === 'actions') {
        this._actions = value;
      } else if (['initialize', 'actions'].indexOf(key) === -1) {
        // Needed to support listenTo returned in an array.
        // TODO: Would be nice to eventually convert this into a map lookup for
        // efficiency. Possibly by creating a StoreBody object.
        if (Array.isArray(value)) {
          this._mappings[key] = function(payload, dispatchKey) {
            value.some(callback => callback.call(this, payload, dispatchKey));
          };
        } else {
          this._mappings[key] = value;
        }
      }
    }
  };

  /**
   * Private method that constructs the method context that gets applied when
   * executing a event.
   * @return {Object} Base context for an event being executed.
   */
  _getContext() {
    return {
      'emitChange': () => {
        this.emit("change");
      },
      'set': (key, value) => {
        this._state[key] = value;
        this.emit("change");
      },
      'state': this.state,
      'actions': flux.actions(this._name),
      'getStore': function(name) {
        return flux.getStore.apply(flux, name);
      }
    };
  }

  /**
   * Constructs a callback that gets registered with the dispatcher to
   * facilitate a store listening to dispacher dispatches.
   * @return The callback that's registered with the dispatcher.
   */
  getDispatcherCallback(flux) {
    return (payload) => {
      let key = payload.source;
      if (!(key instanceof DispatchKey)) {
        throw new Error('dispatchKey required in order to dispatch.');
      }

      // Is this store listening for this event group?
      if (key.group !== this._name && this._actions.indexOf(key.group) === -1) {
        return;
      }

      // Find method to execute.
      const source = key.label;
      var method = this._mappings[source];
      if (!method && this._templates[source]) {
        method = this._templates[source].keyToMethod(key);
      }

      // Execute event handling.
      if (method) {
        method.call(this._getContext(), payload.data, payload.source);
      }
    };
  };

}

module.exports = Store;
