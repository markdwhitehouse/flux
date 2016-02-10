!function t(e,n,r){function i(s,a){if(!n[s]){if(!e[s]){var c="function"==typeof require&&require;if(!a&&c)return c(s,!0);if(o)return o(s,!0);throw new Error("Cannot find module '"+s+"'")}var u=n[s]={exports:{}};e[s][0].call(u.exports,function(t){var n=e[s][1][t];return i(n?n:t)},u,u.exports,t,e,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)i(r[s]);return i}({1:[function(t,e,n){function r(t){return null===t||void 0===t}function i(t){return t&&"object"==typeof t&&"number"==typeof t.length?"function"!=typeof t.copy||"function"!=typeof t.slice?!1:t.length>0&&"number"!=typeof t[0]?!1:!0:!1}function o(t,e,n){var o,l;if(r(t)||r(e))return!1;if(t.prototype!==e.prototype)return!1;if(c(t))return c(e)?(t=s.call(t),e=s.call(e),u(t,e,n)):!1;if(i(t)){if(!i(e))return!1;if(t.length!==e.length)return!1;for(o=0;o<t.length;o++)if(t[o]!==e[o])return!1;return!0}try{var f=a(t),p=a(e)}catch(h){return!1}if(f.length!=p.length)return!1;for(f.sort(),p.sort(),o=f.length-1;o>=0;o--)if(f[o]!=p[o])return!1;for(o=f.length-1;o>=0;o--)if(l=f[o],!u(t[l],e[l],n))return!1;return typeof t==typeof e}var s=Array.prototype.slice,a=t("./lib/keys.js"),c=t("./lib/is_arguments.js"),u=e.exports=function(t,e,n){return n||(n={}),t===e?!0:t instanceof Date&&e instanceof Date?t.getTime()===e.getTime():!t||!e||"object"!=typeof t&&"object"!=typeof e?n.strict?t===e:t==e:o(t,e,n)}},{"./lib/is_arguments.js":2,"./lib/keys.js":3}],2:[function(t,e,n){function r(t){return"[object Arguments]"==Object.prototype.toString.call(t)}function i(t){return t&&"object"==typeof t&&"number"==typeof t.length&&Object.prototype.hasOwnProperty.call(t,"callee")&&!Object.prototype.propertyIsEnumerable.call(t,"callee")||!1}var o="[object Arguments]"==function(){return Object.prototype.toString.call(arguments)}();n=e.exports=o?r:i,n.supported=r,n.unsupported=i},{}],3:[function(t,e,n){function r(t){var e=[];for(var n in t)e.push(n);return e}n=e.exports="function"==typeof Object.keys?Object.keys:r,n.shim=r},{}],4:[function(t,e,n){e.exports=t("./lib/Dispatcher")},{"./lib/Dispatcher":5}],5:[function(t,e,n){function r(){"use strict";this.$Dispatcher_callbacks={},this.$Dispatcher_isPending={},this.$Dispatcher_isHandled={},this.$Dispatcher_isDispatching=!1,this.$Dispatcher_pendingPayload=null}var i=t("./invariant"),o=1,s="ID_";r.prototype.register=function(t){"use strict";var e=s+o++;return this.$Dispatcher_callbacks[e]=t,e},r.prototype.unregister=function(t){"use strict";i(this.$Dispatcher_callbacks[t],"Dispatcher.unregister(...): `%s` does not map to a registered callback.",t),delete this.$Dispatcher_callbacks[t]},r.prototype.waitFor=function(t){"use strict";i(this.$Dispatcher_isDispatching,"Dispatcher.waitFor(...): Must be invoked while dispatching.");for(var e=0;e<t.length;e++){var n=t[e];this.$Dispatcher_isPending[n]?i(this.$Dispatcher_isHandled[n],"Dispatcher.waitFor(...): Circular dependency detected while waiting for `%s`.",n):(i(this.$Dispatcher_callbacks[n],"Dispatcher.waitFor(...): `%s` does not map to a registered callback.",n),this.$Dispatcher_invokeCallback(n))}},r.prototype.dispatch=function(t){"use strict";i(!this.$Dispatcher_isDispatching,"Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch."),this.$Dispatcher_startDispatching(t);try{for(var e in this.$Dispatcher_callbacks)this.$Dispatcher_isPending[e]||this.$Dispatcher_invokeCallback(e)}finally{this.$Dispatcher_stopDispatching()}},r.prototype.isDispatching=function(){"use strict";return this.$Dispatcher_isDispatching},r.prototype.$Dispatcher_invokeCallback=function(t){"use strict";this.$Dispatcher_isPending[t]=!0,this.$Dispatcher_callbacks[t](this.$Dispatcher_pendingPayload),this.$Dispatcher_isHandled[t]=!0},r.prototype.$Dispatcher_startDispatching=function(t){"use strict";for(var e in this.$Dispatcher_callbacks)this.$Dispatcher_isPending[e]=!1,this.$Dispatcher_isHandled[e]=!1;this.$Dispatcher_pendingPayload=t,this.$Dispatcher_isDispatching=!0},r.prototype.$Dispatcher_stopDispatching=function(){"use strict";this.$Dispatcher_pendingPayload=null,this.$Dispatcher_isDispatching=!1},e.exports=r},{"./invariant":6}],6:[function(t,e,n){"use strict";var r=function(t,e,n,r,i,o,s,a){if(!t){var c;if(void 0===e)c=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var u=[n,r,i,o,s,a],l=0;c=new Error("Invariant Violation: "+e.replace(/%s/g,function(){return u[l++]}))}throw c.framesToPop=1,c}};e.exports=r},{}],7:[function(t,e,n){(function(){"use strict";function t(){}function n(t,e){for(var n=t.length;n--;)if(t[n].listener===e)return n;return-1}function r(t){return function(){return this[t].apply(this,arguments)}}var i=t.prototype,o=this,s=o.EventEmitter;i.getListeners=function(t){var e,n,r=this._getEvents();if(t instanceof RegExp){e={};for(n in r)r.hasOwnProperty(n)&&t.test(n)&&(e[n]=r[n])}else e=r[t]||(r[t]=[]);return e},i.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},i.getListenersAsObject=function(t){var e,n=this.getListeners(t);return n instanceof Array&&(e={},e[t]=n),e||n},i.addListener=function(t,e){var r,i=this.getListenersAsObject(t),o="object"==typeof e;for(r in i)i.hasOwnProperty(r)&&-1===n(i[r],e)&&i[r].push(o?e:{listener:e,once:!1});return this},i.on=r("addListener"),i.addOnceListener=function(t,e){return this.addListener(t,{listener:e,once:!0})},i.once=r("addOnceListener"),i.defineEvent=function(t){return this.getListeners(t),this},i.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},i.removeListener=function(t,e){var r,i,o=this.getListenersAsObject(t);for(i in o)o.hasOwnProperty(i)&&(r=n(o[i],e),-1!==r&&o[i].splice(r,1));return this},i.off=r("removeListener"),i.addListeners=function(t,e){return this.manipulateListeners(!1,t,e)},i.removeListeners=function(t,e){return this.manipulateListeners(!0,t,e)},i.manipulateListeners=function(t,e,n){var r,i,o=t?this.removeListener:this.addListener,s=t?this.removeListeners:this.addListeners;if("object"!=typeof e||e instanceof RegExp)for(r=n.length;r--;)o.call(this,e,n[r]);else for(r in e)e.hasOwnProperty(r)&&(i=e[r])&&("function"==typeof i?o.call(this,r,i):s.call(this,r,i));return this},i.removeEvent=function(t){var e,n=typeof t,r=this._getEvents();if("string"===n)delete r[t];else if(t instanceof RegExp)for(e in r)r.hasOwnProperty(e)&&t.test(e)&&delete r[e];else delete this._events;return this},i.removeAllListeners=r("removeEvent"),i.emitEvent=function(t,e){var n,r,i,o,s=this.getListenersAsObject(t);for(i in s)if(s.hasOwnProperty(i))for(r=s[i].length;r--;)n=s[i][r],n.once===!0&&this.removeListener(t,n.listener),o=n.listener.apply(this,e||[]),o===this._getOnceReturnValue()&&this.removeListener(t,n.listener);return this},i.trigger=r("emitEvent"),i.emit=function(t){var e=Array.prototype.slice.call(arguments,1);return this.emitEvent(t,e)},i.setOnceReturnValue=function(t){return this._onceReturnValue=t,this},i._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},i._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return o.EventEmitter=s,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof e&&e.exports?e.exports=t:o.EventEmitter=t}).call(this)},{}],8:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=function(){function t(e,n,i){if(r(this,t),!e||!n||!i)throw new Error("ActionBody: key, context, and callback required.");this._key=e,this._context=n,this._callback=i}return i(t,[{key:"key",get:function(){return this._key}},{key:"context",get:function(){return this._context}},{key:"callback",get:function(){return this._callback}}]),t}();e.exports=o},{}],9:[function(t,e,n){"use strict";function r(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),s=t("./ActionBody"),a=t("./DispatchKey"),c=function(){function t(e){i(this,t),this._flux=e,this._customActions={},this._storeActions={}}return o(t,[{key:"initCustomActions",value:function(e,n){this._flux;if(this._customActions[e])throw new Error('createActions: group "'+e+'" already exists.');this._customActions[e]=Object.keys(n).reduce(function(r,i){var o=void 0,c=void 0,u=void 0;n[i]instanceof s?(o=n[i].key,c=n[i].context,u=n[i].callback):(o=i,u=n[i]);var l=new a(e,o,c);return r[i]=t.wrapActionCallback(l,u),r},{})}},{key:"initStoreActions",value:function(e){var n=this._flux._storeManager.stores,r=n[e],i={};for(var o in r._templates){var s=r._templates[o];for(var c in s._actionHandlers){var u=new a(e,o+c),l=s._actionHandlers[c];i[o+c]=t.wrapActionCallback(u,l)}}for(var o in r._mappings)i[o]=function(t){return function(e){flux.dispatch(t,e)}}(new a(e,o));Object.keys(i).length&&(this._storeActions[e]=i)}},{key:"actionWithContext",value:function(t,e,n){return new s(t,e,n)}},{key:"findActions",value:function(t){return this._customActions[t]?this._customActions[t]:this._storeActions[t]?this._storeActions[t]:void 0}}],[{key:"wrapActionCallback",value:function(t,e){return function(){var n=e.apply({dispatch:function(){for(var e=arguments.length,n=Array(e),i=0;e>i;i++)n[i]=arguments[i];var o=n.pop();n=[t.group].concat(n);var s=new(Function.prototype.bind.apply(a,[null].concat(r(n))));flux.dispatch(s,o)}},arguments);n&&flux.dispatch(t,n)}}}]),t}();e.exports=c},{"./ActionBody":8,"./DispatchKey":10}],10:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=t("deep-equal"),s=function(){function t(e,n,i){if(r(this,t),!e||!n)throw new Error("DispatchKey requires a group and label.");this._group=e,this._label=n,this._context=i}return i(t,[{key:"clone",value:function(e){var n=Object.assign({},this._context,e);return new t(this._group,this._label,n)}},{key:"group",get:function(){return this._group}},{key:"label",get:function(){return this._label}},{key:"context",get:function(){return this._context}}],[{key:"withContext",value:function(t,e){if(!t||!e)throw new Error("withContext: requires context and callback.");return function(n,r){return o(t,r.context)?(e.call(this,n,r),!0):void 0}}}]),t}();e.exports=s},{"deep-equal":1}],11:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=t("react-dispatcher"),s=t("./DispatchKey.js"),a=function(){function t(e){if(r(this,t),!e)throw new Error("DispatchManager: requires flux parameter.");this._dispatcher=new o,this._flux=e}return i(t,[{key:"registerStoreCallback",value:function(t){var e=this._flux._storeManager.stores;e.hasOwnProperty(t)&&this._dispatcher.register(e[t].getDispatcherCallback())}},{key:"dispatch",value:function(t,e){if(!(t instanceof s))throw new Error("dispatch: dispatchKey must be a DispatchKey, not "+t);var n={source:t,data:e};this._dispatcher.isDispatching()?setTimeout(function(){this._dispatcher.dispatch(n)},0):this._dispatcher.dispatch(n)}}]),t}();e.exports=a},{"./DispatchKey.js":10,"react-dispatcher":4}],12:[function(t,e,n){(function(e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var r=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),i=t("./ActionManager"),o=t("./DispatchKey"),s=t("./DispatchManager"),a=(t("./Store"),t("./StoreManager")),c=t("./Template"),u={Ajax:t("./templates/Ajax.js")},l=function(){function t(){n(this,t),this._storeManager=new a(this),this._actionManager=new i(this),this._dispatchManager=new s(this)}return r(t,[{key:"actions",value:function(t){return this._actionManager.findActions(t)}},{key:"actionWithContext",value:function(t,e,n){return this._actionManager.actionWithContext(t,e,n)}},{key:"createActions",value:function(t,e){this._actionManager.initCustomActions(t,e)}},{key:"createStore",value:function(t,e){this._storeManager.createStore(t,e),this._actionManager.initStoreActions(t),this._dispatchManager.registerStoreCallback(t)}},{key:"createTemplate",value:function(t,e){return c.create(t,e)}},{key:"dispatch",value:function(t,e){this._dispatchManager.dispatch(t,e)}},{key:"getStore",value:function(t){return a.getStoreState(t,this._storeManager._stores)}},{key:"listenTo",value:function(t,e){return o.withContext(t,e)}},{key:"setStores",value:function(){return a.setStoreMixin(this._storeManager.stores).apply(void 0,arguments)}}]),t}();for(var f in u)l[f]=u[f];e.Flux=l}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./ActionManager":9,"./DispatchKey":10,"./DispatchManager":11,"./Store":13,"./StoreManager":14,"./Template":15,"./templates/Ajax.js":16}],13:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=t("./DispatchKey.js"),c=t("wolfy87-eventemitter"),u=t("./Template.js"),l=function(t){function e(t,n,o){if(r(this,e),!t||!n||!o)throw new Error("Store: requires paramaters flux, name, and definition.");var s=i(this,Object.getPrototypeOf(e).call(this));return s._flux=t,s._name=n,s._definition=o,s._actions=[],s._mappings={},s._state={},s._templates={},s._initializeTemplatesAndMappings(),o.initialize&&(s._state=Object.assign(s._state,o.initialize())),s}return o(e,t),s(e,[{key:"_initializeTemplatesAndMappings",value:function(){var t=this,e=this._definition,n=function(n){var r=e[n];if(r instanceof u){var i=r;i.store=t._name,i.identifier=n,i.initStore(),i.initActions(),i._storeHandlers.INIT.call(t._getContext(),null,null,!0),t._state[n]=i.state,t._templates[n]=i}else"actions"===n?t._actions=r:-1===["initialize","actions"].indexOf(n)&&(Array.isArray(r)?t._mappings[n]=function(t,e){var n=this;r.some(function(r){return r.call(n,t,e)})}:t._mappings[n]=r)};for(var r in e)n(r)}},{key:"_getContext",value:function(){var t=this;return{emitChange:function(){t.emit("change")},set:function(e,n){t._state[e]=n,t.emit("change")},state:this.state,actions:flux.actions(this._name),getStore:function(t){return flux.getStore.apply(flux,t)}}}},{key:"getDispatcherCallback",value:function(t){var e=this;return function(t){var n=t.source;if(!(n instanceof a))throw new Error("dispatchKey required in order to dispatch.");if(n.group===e._name||-1!==e._actions.indexOf(n.group)){var r=n.label,i=e._mappings[r];!i&&e._templates[r]&&(i=e._templates[r].keyToMethod(n)),i&&i.call(e._getContext(),t.data,t.source)}}}},{key:"state",get:function(){return Object.assign({},this._state)}}]),e}(c);e.exports=l},{"./DispatchKey.js":10,"./Template.js":15,"wolfy87-eventemitter":7}],14:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=t("./Store.js"),s=function(){function t(e){if(r(this,t),!e)throw new Error("StoreManager requires flux parameter.");this._flux=e,this._stores={}}return i(t,[{key:"createStore",value:function(t,e){void 0===this._stores[t]&&(this._stores[t]=new o(this._flux,t,e))}},{key:"stores",get:function(){return this._stores}}],[{key:"setStoreMixin",value:function(t){return function(){var e=Array.prototype.slice.call(arguments);return{componentWillMount:function(){for(var n in e)t[e[n]].on("change",this._syncStateEventListener);this._syncStateEventListener()},componentWillUnmount:function(){for(var n in e)t[e[n]].off("change",this._syncStateEventListener)},_syncStateEventListener:function(){if(this.syncStores){var n={};for(var r in e){var i=e[r];n[i]=Object.assign({},t[i].state)}this.syncStores(n)}}}}}},{key:"getStoreState",value:function(t,e){var n=e[t];if(!n)throw new Error("getStoreState: store "+t+" not found.");return n.state}}]),t}();e.exports=s},{"./Store.js":13}],15:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),o=function(){function t(e){if(r(this,t),!e.type||!e.definition)throw new Error("Template: requires type, identifier, and definition.");this._type=e.type,this._store=null,this._identifier=null,this._definition=e.definition,this._actionHandlers={},this._storeHandlers={},this._configs={}}return i(t,[{key:"actionHandler",value:function(t,e){if(!t||!e)throw new Error("actionHandler: expects label and callback.");this._actionHandlers[t]=e}},{key:"storeHandler",value:function(){function t(t,e,n){var r=this;this._storeHandlers[t]=function(){for(var t=arguments.length,i=Array(t),o=0;t>o;o++)i[o]=arguments[o];n&&n.apply(r,i),e&&r._definition[e]&&r._definition[e].apply(this,[i[0],this.configs]),n&&this.emitChange()}}var e=Array.prototype.slice.call(arguments);if(3===e.length)t.apply(this,e);else{if(2!==e.length)throw new Error("storeHandler: expects two or three parameters.");t.apply(this,[e[0],void 0,e[1]])}}},{key:"actionHandlers",get:function(){return this._actionHandlers}},{key:"definition",get:function(){return this._definition}},{key:"identifier",get:function(){return this._identifier},set:function(t){this._identifier=t}},{key:"store",get:function(){return this._store},set:function(t){this._store=t}},{key:"storeHandlers",get:function(){return this._storeHandlers}},{key:"type",get:function(){return this._type}}],[{key:"create",value:function(t,e){return new t(e)}}]),t}();e.exports=o},{}],16:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function f(t,e,n){null===t&&(t=Function.prototype);var r=Object.getOwnPropertyDescriptor(t,e);if(void 0===r){var i=Object.getPrototypeOf(t);return null===i?void 0:f(i,e,n)}if("value"in r)return r.value;var o=r.get;if(void 0!==o)return o.call(n)},c=(t("../DispatchKey.js"),t("../Template.js")),u={UNINITIALIZED:"UNINITIALIZED",INIT:"INIT",SUBMITTING:"SUBMITTING",SUCCESS:"SUCCESS",FAIL:"FAIL",RESET:"RESET",TIMEOUT:"TIMEOUT"},l=function(t){function e(t){r(this,e);var n=i(this,Object.getPrototypeOf(e).call(this,{type:"REQUEST",definition:t}));return n._state={model:null,status:u.UNINITIALIZED,error:null,errorType:null,configs:null,response:null},n}return o(e,t),s(e,[{key:"keyToMethod",value:function(t){var e=t.context;return e&&e.status?this.storeHandlers[e.status]:void 0}},{key:"initActions",value:function(){var t=this,n={type:t.type},r=function(e){var r=this;this.dispatch(t.identifier,Object.assign({status:"SUBMITTING"},n),{});var i=Object.assign(e,{success:function(e){var n=this,i=new t._definition.model(e,{parse:!0});if(e.error&&failure)r.dispatch(dispatch.clone({status:"FAIL"}),e);else{"json"==n.dataType&&n.data?JSON.parse(n.data)||{}:{};r.dispatch(t.identifier,Object.assign({status:"SUCCESS"}),{response:e,model:i,request:n})}},error:function(e){e.statusText.toUpperCase()==u.TIMEOUT?r.dispatch(t.identifier,Object.assign({status:"TIMEOUT"}),{}):r.dispatch(t.identifier,Object.assign({status:"FAIL"}),e.responseJSON||e||{error:"Unable to perform request."})}});$.ajax(i)};a(Object.getPrototypeOf(e.prototype),"actionHandler",this).call(this,"Init",function(){var e=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.dispatch(t.identifier,Object.assign({status:"INIT"},n),e)}),a(Object.getPrototypeOf(e.prototype),"actionHandler",this).call(this,"Reset",function(){this.dispatch(t.identifier,Object.assign({status:"RESET"}),{})}),a(Object.getPrototypeOf(e.prototype),"actionHandler",this).call(this,"Get",function(e,n,i){i=i||{};var o=t._state.model.clone();o.setUrl(e);var s={data:n,dataType:"json",method:"GET",url:o.url};i.timeout&&(s.timeout=i.timeout),r.call(this,s)}),a(Object.getPrototypeOf(e.prototype),"actionHandler",this).call(this,"Post",function(e,n,i){i=i||{};var o=t._state.model.clone();o.setUrl(e);var s={data:n,dataType:"json",method:"POST",url:o.url};i.sendJson&&(s=_.extend(s,{data:JSON.stringify(n),contentType:"application/json; charset=utf-8"})),i.timeout&&(s.timeout=i.timeout),r.call(this,s)})}},{key:"initStore",value:function(){var t=this;a(Object.getPrototypeOf(e.prototype),"storeHandler",this).call(this,"SUBMITTING","onSubmitting",function(){t._state.status=u.SUBMITTING,t._state.error=null}),a(Object.getPrototypeOf(e.prototype),"storeHandler",this).call(this,"SUCCESS","onSuccess",function(e){t._state.model=e.model,t._state.status=u.SUCCESS,t._state.error=null,t._state.response=e}),a(Object.getPrototypeOf(e.prototype),"storeHandler",this).call(this,"FAIL","onFail",function(e){t._state.status=u.FAILURE,t._state.error=e.error,t._state.response=e}),a(Object.getPrototypeOf(e.prototype),"storeHandler",this).call(this,"TIMEOUT","onTimeout",function(e){t._state.status=u.TIMEOUT,t._state.error="Request timed out. Please try again."}),a(Object.getPrototypeOf(e.prototype),"storeHandler",this).call(this,"RESET","onReset",function(){t._state.status=u.INITIALIZED,t._state.error=null,t._state.response=null}),a(Object.getPrototypeOf(e.prototype),"storeHandler",this).call(this,"INIT","onInit",function(t,e,n){if(!n){if(this._state.status!=u.UNINITIALIZED)return;this._state.status=u.INITIALIZED}this.configs=t;var r=this._definition;r&&r.model&&(r.model.prototype instanceof Backbone.Model?this._state.model=new r.model:"function"==typeof r.model?this._state.model=r.model.apply(this,[t]):this._state.model=r.model,this._state.model.storeKey=this._identifier)})}},{key:"state",get:function(){return this._state}}]),e}(c);e.exports=l},{"../DispatchKey.js":10,"../Template.js":15}]},{},[12]);