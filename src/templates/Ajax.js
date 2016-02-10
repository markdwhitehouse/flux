const DispatchKey = require('../DispatchKey.js');
const Template = require('../Template.js')

// Possible argument to be made that this could be done with symbols. Though,
// not sure how great symbols works with Babel polyfill.
const ACTION = {
  'UNINITIALIZED': 'UNINITIALIZED',
  'INIT': 'INIT',
  'SUBMITTING': 'SUBMITTING',
  'SUCCESS': 'SUCCESS',
  'FAIL': 'FAIL',
  'RESET': 'RESET',
  'TIMEOUT': 'TIMEOUT'
};

/** Custom template implementation for managing get and post AJAX requests. */
class Ajax extends Template {
  /**
   * Creates an ajax istance.
   * @param {Object} definition Event hooks exposed by template like: init,
   *                            onSuccess, etc.
   */
  constructor(definition) {
    super({
      type: 'REQUEST',
      definition: definition
    });

    this._state = {
      model: null,
      status: ACTION.UNINITIALIZED,
      error: null,
      errorType: null,
      configs: null,
      response: null
    };
  };

  /**
   * Retrieves state object.
   * @return {Object} The state object.
   */
  get state() {
    return this._state;
  };

  /**
   * Helper method to tell store how to map a DispatchKey onto a template
   * event handler.
   * @param {DispatchKey} key DispatchKey from a dispatch.
   * @return {Function} The handler method if found.
   */
  keyToMethod(key) {
    const context = key.context;
    if (context && context.status) {
      return this.storeHandlers[context.status];
    }
  };

  /** Initialize the action handlers for the template. */
  initActions() {

    const template = this;
    const context = {type: template.type};

    const ajax = function(ajaxConfigs) {
      var self = this;

      this.dispatch(template.identifier, Object.assign({status: 'SUBMITTING'}, context), {});

      let params = Object.assign(ajaxConfigs, {
        success: function(response) {
          var request = this;

          // New model kind of sucks, but better than writing a parse on
          // every model.
          var model = new template._definition.model(response, {parse: true});

          // When using an iframe, we can't detect the response type. We must
          // therefore examine the data as JSON to determine if this is a
          // success or failure. Suck.
          if (response.error && failure) {
            self.dispatch(dispatch.clone({status: 'FAIL'}), response);
          } else {

            var requestData = (request.dataType == "json" && request.data) ?
              JSON.parse(request.data) || {} : {};

            self.dispatch(template.identifier, Object.assign({status: 'SUCCESS'}), {
              response: response,
              model: model,
              request: request
            });
          }

        },
        error: function(response) {
          if (response.statusText.toUpperCase() == ACTION.TIMEOUT) {
            self.dispatch(template.identifier, Object.assign({status: 'TIMEOUT'}), {});
          } else {
            self.dispatch(template.identifier, Object.assign({status: 'FAIL'}),
                response.responseJSON || response || {
              error: 'Unable to perform request.'
            });
          }
        }
      });

      $.ajax(params);
    };

    super.actionHandler('Init', function(configs = {}) {
      this.dispatch(template.identifier, Object.assign({status: 'INIT'}, context), configs);
    });

    super.actionHandler('Reset', function() {
      this.dispatch(template.identifier, Object.assign({status: 'RESET'}), {});
    });

    super.actionHandler('Get', function(urlParams, data, options) {
      options = options || {};
      var model = template._state.model.clone();
      model.setUrl(urlParams);

      var requesConfigs = {
        data: data,
        dataType: 'json',
        method: 'GET',
        url: model.url
      };

      if (options.timeout) {
        requesConfigs.timeout = options.timeout;
      }

      ajax.call(this, requesConfigs);
    });

    super.actionHandler('Post', function(urlParams, data, options) {
      options = options || {};
      var model = template._state.model.clone();
      model.setUrl(urlParams);

      var requesConfigs = {
        data: data,
        dataType: 'json',
        method: 'POST',
        url: model.url
      };

      if (options.sendJson) {
        requesConfigs = _.extend(requesConfigs, {
          data: JSON.stringify(data),
          contentType: 'application/json; charset=utf-8'
        });
      }
      if (options.timeout) {
        requesConfigs.timeout = options.timeout;
      }

      ajax.call(this, requesConfigs);
    });

  };

  /** Initialize the store handlers for the template. */
  initStore() {

    super.storeHandler('SUBMITTING', 'onSubmitting', () => {
      this._state.status = ACTION.SUBMITTING;
      this._state.error = null;
    });

    super.storeHandler('SUCCESS', 'onSuccess', (payload) => {
      this._state.model = payload.model;
      this._state.status = ACTION.SUCCESS;
      this._state.error = null;
      this._state.response = payload;
    });

    super.storeHandler('FAIL', 'onFail', (payload) => {
      this._state.status = ACTION.FAILURE;
      this._state.error = payload.error;
      this._state.response = payload;
    });

    super.storeHandler('TIMEOUT', 'onTimeout', (payload) => {
      this._state.status = ACTION.TIMEOUT;
      this._state.error = 'Request timed out. Please try again.';
    });

    super.storeHandler('RESET', 'onReset', () => {
      this._state.status = ACTION.INITIALIZED;
      this._state.error = null;
      this._state.response = null;
    });

    super.storeHandler('INIT', 'onInit', function(configs, key, initialize) {
      if (!initialize) {
        if (this._state.status != ACTION.UNINITIALIZED) return;
        this._state.status = ACTION.INITIALIZED;
      }

      this.configs = configs;
      let def = this._definition;
      if (def && def.model) {
        if (def.model.prototype instanceof Backbone.Model) {
          this._state.model = new def.model();
        } else if (typeof def.model === 'function') {
          this._state.model = def.model.apply(this, [configs]);
        } else {
          this._state.model = def.model;
        }

        this._state.model.storeKey = this._identifier;

        // TODO: Not tested, so commenting out.
        // if (def.dependency) {
        //   def.dependency.forEach(function(key) {
        //     var dependency = self[key + 'LoadSetup'];
        //     if (dependency) {
        //       var init = dependency();
        //       if (init.load && init.model) {
        //         var load = init.load.apply(this, [alchemy.getActions(), configs]);
        //         load(init.model);
        //       }
        //     }
        //   });
        // }
      }
    });
  };

}

module.exports = Ajax;
