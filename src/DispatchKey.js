var deepEqual = require('deep-equal');

/**
 * Identifies an action as it is transferred to stores. The dispatcher receives
 * a DispatchKey and payload and then broadcasts that data to all stores. Stores
 * then upack the DispatchKey to determine if the dispatch is relevant for the
 * store.
 */
class DispatchKey {
  /**
   * Creates a dispatch key.
   * @param {string} group Either the action group or store name.
   * @param {string} label The store event key to reference.
   * @param {Object} context Arbitrary data for qualifying dispatch.
   */
  constructor(group, label, context) {
    if (!group || !label) {
      throw new Error("DispatchKey requires a group and label.");
    }

    this._group = group
    this._label = label;
    this._context = context;
  }

  /**
   * Retrieves group value.
   * @return {string} The group value.
   */
  get group() {
    return this._group;
  };

  /**
   * Retrieves label value.
   * @return {string} The label value.
   */
  get label() {
    return this._label;
  };

  /**
   * Retrieves context value.
   * @return {Object} The context value.
   */
  get context() {
    return this._context;
  };

  /**
   * Clones a dispatch key and augments it optional context.
   * @param {Object} context Additional data to add to dispatch key when
   *                         cloning.
   * @return {DispatchKey} A new dispatch key.
   */
  clone(context) {
    const newContext = Object.assign({}, this._context, context);
    return new DispatchKey(this._group, this._label, newContext);
  }

  /**
   * Helper method allowing a store event to filter dispatches based on the
   * context of the dispatch.
   * @param {Object} context Arbitrary contextual data to use for filtering.
   * @param {Function} callback Method to call when event matches on dispatch.
   * @return {Function} Proxy for callback that filters events by context.
   */
  static withContext(context, callback) {
    if (!context || !callback) {
      throw new Error('withContext: requires context and callback.');
    }
    return function(payload, dispatchKey) {
      if (deepEqual(context, dispatchKey.context)) {
        callback.call(this, payload, dispatchKey);
        return true;
      }
    }
  };
}

module.exports = DispatchKey;
