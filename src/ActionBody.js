/**
 * Transport mechanism used while instantiating some types of actions.
 *
 * As an example, Flux.actionWithContext(key, context, callback) uses ActionBody
 * to capture the parameterization.
 */
class ActionBody {
  /**
   * Create an action body.
   * @param {string} key Reference to key specified in store.
   * @param {Object} context Qualifying parameters for action context.
   * @param {Function} callback Action body or logic.
   */
  constructor(key, context, callback) {
    if (!key || !context || !callback) {
      throw new Error('ActionBody: key, context, and callback required.');
    }

    this._key = key;
    this._context = context;
    this._callback = callback;
  }

  /**
   * Retrieves key value.
   * @return {string} The key value.
   */
  get key() {
    return this._key;
  }

  /**
   * Retrieves context value.
   * @return {Object} The context value.
   */
  get context() {
    return this._context;
  }

  /**
   * Retrieves callback function.
   * @return {Function} The context function.
   */
  get callback() {
    return this._callback;
  }
}

module.exports = ActionBody;
