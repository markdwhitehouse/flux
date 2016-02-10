const ActionBody = require('./ActionBody');
const DispatchKey = require('./DispatchKey');

/** Wraps and manages action behavior. */
class ActionManager {

  /**
   * Creates an action manager.
   * @param {Flux} flux An instance of Flux.
   */
  constructor(flux) {
    // Cache reference to Flux instance..
    this._flux = flux;

    // Actions created using the flux.creatActions method.
    // Indexed by actions group label.
    this._customActions = {};

    // Actions automatically created resulting from store behavior.
    // Indexed by store name.
    this._storeActions = {};
  };

  /**
   * Action manager instance is created before actions are defined. This
   * should be called as a result of running a Flux.createActions.
   * @param {string} group A label that thematically describes set of actions.
   * @param {Object} actions Action definitions.
   */
  initCustomActions(group, actions) {
    const flux = this._flux;

    if (this._customActions[group]) {
      throw new Error(`createActions: group "${group}" already exists.`);
    }

    this._customActions[group] = Object.keys(actions).reduce((memo, key) => {
      let action, context, callback;
      if (actions[key] instanceof ActionBody) {
        action = actions[key].key;
        context = actions[key].context;
        callback = actions[key].callback;
      } else {
        action = key;
        callback = actions[key];
      }

      const dispatchKey = new DispatchKey(group, action, context);
      memo[key] = ActionManager.wrapActionCallback(dispatchKey, callback);
      return memo;
    }, {});
  };

  /**
   * Action manager instance is created before stores are defined. Creates
   * default actions based on store definition in order to simplify the
   * implementation of Flux pattern. This gets called as a result of
   * running a Flux.createStore.
   * @param {string} name The name of store to initialize.
   */
  initStoreActions(name) {
    const stores = this._flux._storeManager.stores;
    const store = stores[name];

    let actions = {};

    // Save reference to template actions.
    for (let i in store._templates) {
      var template = store._templates[i];
      for (let j in template._actionHandlers) {
        var key = new DispatchKey(name, i + j);
        var callback = template._actionHandlers[j];
        actions[i + j] = ActionManager.wrapActionCallback(key, callback);
      }
    }

    // Save reference to other mappings.
    for (let i in store._mappings) {
      actions[i] = (function(key) {
        return function(data) {
          flux.dispatch(key, data);
        }
      })(new DispatchKey(name, i));
    }

    if (Object.keys(actions).length) {
      this._storeActions[name] = actions;
    }
  };

  /**
   * For more complex actions it can be necessary to contextualize the action
   * with arbitrary data. Stores can then filter on the contextualization when
   * processing events.
   * @param {string} action Label referencing store key for event.
   * @param {Object} context Arbitrary data on which a store can filter.
   * @param {Function} callback Code to process when executing action.
   * @return {ActionBody} Action definition.
   */
  actionWithContext(action, context, callback) {
    return new ActionBody(action, context, callback);
  };

  /**
   * Retrieves actions by qualifier. For instance, when creating actions the
   * first parameter is the name of the group of actions. Passing in that group
   * name would retrieve actions for that group.
   * @param {string} qualifier The action qualifier reference or store name.
   * @return {Object} An object of action methods.
   */
  findActions(qualifier) {
    if (this._customActions[qualifier]) return this._customActions[qualifier];
    if (this._storeActions[qualifier]) return this._storeActions[qualifier];
  };

  /**
   * Wraps an action callback in order to override method context during
   * execution of method.
   *
   * Adds:
   *  this.dispatch(key, payload);
   *
   * @param {DispatchKey} key A DispatchKey instance for the action.
   * @param {Function} callback Method that is called when actino is executed.
   * @return {Function} A proxy method for callback that executes callback.
   */
  static wrapActionCallback(key, callback) {
    return function() {
      const payload = callback.apply({
        dispatch: (...args) => {
          const payload = args.pop();
          args = [key.group].concat(args);
          var newKey = new DispatchKey(...args);
          flux.dispatch(newKey, payload)
        }
      }, arguments);
      if (payload) {
        flux.dispatch(key, payload);
      }
    }
  };
}

module.exports = ActionManager;
