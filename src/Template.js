/** Super class of template implementations. */
class Template {
  /**
   * Creates a template. Mostly this gets extended from template implementations.
   * @param {Object} config Data used to initialize the template.
   */
  constructor(config) {
    if (!config.type || !config.definition) {
      throw new Error('Template: requires type, identifier, and definition.');
    }

    this._type = config.type;
    this._store = null;
    this._identifier = null;
    this._definition = config.definition;
    this._actionHandlers = {};
    this._storeHandlers = {};
    this._configs = {};
  }

  /**
   * Retrieves action handler methods.
   * @return {Object} The action handlers methods.
   */
  get actionHandlers() {
    return this._actionHandlers;
  }

  /**
   * Retrieves definition object.
   * @return {Object} The definition object.
   */
  get definition() {
    return this._definition;
  }

  /**
   * Retrieves identifier value.
   * @return {string} The identifier value.
   */
  get identifier() {
    return this._identifier;
  }

  /**
   * Sets the identifier value.
   * @param {string} value The identifier value.
   */
  set identifier(value) {
    this._identifier = value;
  }

  /**
   * Retrieves store value.
   * @return {string} The store value.
   */
  get store() {
    return this._store;
  }

  /**
   * Sets the store value.
   * @param {string} value The name of the store to which this template is
   *                       being added.
   */
  set store(value) {
    this._store = value;
  }

  /**
   * Retrieves store handler methods.
   * @return {Object} The store handlers methods.
   */
  get storeHandlers() {
    return this._storeHandlers;
  }

  /**
   * Retrieves type value.
   * @return {Object} The type value.
   */
  get type() {
    return this._type;
  }

  /**
   * Templates should define default actions that correspond with custom
   * template behavior. This saves a reference to the default action handler.
   * @param {string} label The label to assign to the action.
   * @param {Function} callback Action logic to execute when action is called.
   */
  actionHandler(label, callback) {
    if (!label || !callback) {
      throw new Error('actionHandler: expects label and callback.');
    }

    this._actionHandlers[label] = callback;
  }

  /**
   * Templates define generic behavior for common store use cases. This is
   * used by a template implementation to store a reference to the
   * custom store handler.
   * @param {string} label The name of the store handler.
   * @param {string|Function} String: Store handlers can trigger an event that
   *                          stores can intercept to further customize the
   *                          behavior of the template. As a string this defines
   *                          the event name. Function: see next parameter.
   * @param {?Function} callback Store handler logic. Either the second or
   *                             third parameter depending on if event hook
   *                             is provided.
   */
  storeHandler() {
    const params = Array.prototype.slice.call(arguments);

    if (params.length === 3) {
      process.apply(this, params);
    } else if (params.length === 2) {
      process.apply(this, [params[0], undefined, params[1]]);
    } else {
      throw new Error("storeHandler: expects two or three parameters.");
    }

    function process(label, event, callback) {
      var self = this;
      this._storeHandlers[label] = function(...args) {
        if (callback) {
          callback.apply(self, args);
        }
        if (event && self._definition[event]) {
          self._definition[event].apply(
            this, [args[0], this.configs]
          );
        }
        if (callback) {
          this.emitChange();
        }
      }
    }
  }

  /**
   * Helper utility for creating template intances.
   * @param {Template} template A template implementation.
   * @param {Object} definition Event hooks or whatever else is needed to
   *                            instantiate the template implementation.
   * @return {Template} A template instance.
   */
  static create(template, definition) {
    return new template(definition);
  }

}

module.exports = Template;
