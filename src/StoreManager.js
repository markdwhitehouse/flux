const Store = require('./Store.js');

/** Wraps and manages stores. */
class StoreManager {
  /**
   * Creates a store manager instance.
   * @param {Flux} flux A Flux instance.
   */
  constructor(flux) {
    if (!flux) {
      throw new Error("StoreManager requires flux parameter.");
    }

    this._flux = flux;
    this._stores = {}
  };

  /**
   * Retrieves available stores.
   * @return {Object} Stores keyed by store name.
   */
  get stores() {
    return this._stores;
  }

  /**
   * Creates a store instance and registers it with the store manager.
   * @param {string} name The name to give the store.
   * @param {Object} definition The specification for the store containing
   *                            events and configurations.
   */
  createStore(name, definition) {
    if (this._stores[name] === undefined) {
      this._stores[name] = new Store(this._flux, name, definition);
    }
  };

  /**
   * Mixin applied to react components enabling listening to store updates.
   * @param {Object} stores An object of available stores.
   * @return {Object} The mixin that react extends onto components.
   */
  static setStoreMixin(stores) {
    return function() {
      var storeNames = Array.prototype.slice.call(arguments);
      return {
        componentWillMount: function() {
          for (var i in storeNames) {
            stores[storeNames[i]].on("change", this._syncStateEventListener);
          }
          this._syncStateEventListener();
        },
        componentWillUnmount: function() {
          for (var i in storeNames) {
            stores[storeNames[i]].off("change", this._syncStateEventListener);
          }
        },
        _syncStateEventListener: function() {
          if (this.syncStores) {
            var data = {};
            for (var i in storeNames) {
              var name = storeNames[i];
              data[name] = Object.assign({}, stores[name].state);
            }
            this.syncStores(data);
          }
        }
      };
    };
  };

  /**
   * Access the state of an available store.
   * @param {string} name The name of the store whose state to return.
   * @param {Object} stores An object of available stores.
   * @return {Object} The state of the store.
   */
  static getStoreState(name, stores) {
    const store = stores[name];
    if (!store) {
      throw new Error(`getStoreState: store ${name} not found.`);
    }
    return store.state;
  };

}

module.exports = StoreManager;
