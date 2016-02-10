const Dispatcher = require('react-dispatcher');
const DispatchKey = require('./DispatchKey.js');

/** Wraps and manages the dispatcher. */
class DispatchManager {
  /**
   * Creates a dispatch manager.
   * @param {Flux} flux An instance of Flux.
   */
  constructor(flux) {
    if (!flux) {
      throw new Error('DispatchManager: requires flux parameter.');
    }

    this._dispatcher = new Dispatcher();
    this._flux = flux;
  };

  /**
   * Registers a reference to store with the dispatcher.
   * @param {string} store The name of the store.
   */
  registerStoreCallback(store) {
    const stores = this._flux._storeManager.stores;
    if (stores.hasOwnProperty(store)) {
      // Initializes dispatcher by registering callbacks from store.
      this._dispatcher.register(stores[store].getDispatcherCallback());
    }
  };

  /**
   * Executes a dispatch resulting from processing an action.
   * @param {DispatchKey} dispatchKey Key specifying dispatch.
   * @param {any} data Generally an {Object} payload from action.
   */
  dispatch(dispatchKey, data) {
    if (!(dispatchKey instanceof DispatchKey)) {
      throw new Error(`dispatch: dispatchKey must be a DispatchKey, not ${dispatchKey}`);
    }

    const payload = { source: dispatchKey, data: data };

    if (this._dispatcher.isDispatching()) {
      setTimeout(function() {
        this._dispatcher.dispatch(payload);
      }, 0);
    } else {
      this._dispatcher.dispatch(payload);
    }
  }

}

module.exports = DispatchManager;
