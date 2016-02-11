## Using Flux Implementation

Lightweight flux implementation with the FE in mind and made to work with
ReactJs. If using the Ajax template, then Backbone, underscore, and jQuery are
needed as well.

##### Builds
Builds found in `build/`.

##### Source
Source found in `src/`.

##### Test script
There's a test JSX script found at `test/src/test.jsx`. **Requires a node server to be running in order to test AJAX functionality.**

```
node test/server.js
```
Then access in the browser.
```
http://127.0.0.1:4000/
```

<a name="Flux"></a>
## API

* [new Flux()](#new_Flux_new)
* [.actions(qualifier)](#Flux+actions) ⇒ <code>Object.&lt;string, function()&gt;</code>
* [.actionWithContext(key, context, callback)](#Flux+actionWithContext) ⇒ <code>function</code>
* [.createActions(group, actions)](#Flux+createActions)
* [.createStore(name, definition)](#Flux+createStore)
* [.createTemplate(template, definition)](#Flux+createTemplate) ⇒ <code>Template</code>
* [.dispatch(dispatchKey, data)](#Flux+dispatch)
* [.getStore(name)](#Flux+getStore) ⇒ <code>Object</code>
* [.listenTo(context, callback)](#Flux+listenTo) ⇒ <code>function</code>
* [.setStores(args)](#Flux+setStores) ⇒ <code>Object.&lt;string, function()&gt;</code>

<a name="new_Flux_new"></a>
### new Flux()
Creates a flux instance.

<a name="Flux+actions"></a>
### flux.actions(qualifier) ⇒ <code>Object.&lt;string, function()&gt;</code>
Retrieves actions based on a qualifier, where the qualifier is either
an action group or store name.

*Example:*
```
Create a store.
flux.createStore('MyStore', { increment: function() {} });

Access actions from that store.
flux.actions('MyStore').increment();
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  
**Returns**: <code>Object.&lt;string, function()&gt;</code> - A map of action methods that can be
                                    called directly with a payload.  

| Param | Type | Description |
| --- | --- | --- |
| qualifier | <code>string</code> | Either or an action group or store name. |

<a name="Flux+actionWithContext"></a>
### flux.actionWithContext(key, context, callback) ⇒ <code>function</code>
Helper method for actions that adds arbitrary contextual data to a dispatch
when an action executes.

*Example:*
```
// Create a store with an event that listens for contextual data.
flux.createStore('MyStore', {
  update: flux.listenTo({mode: 'addition'}, function(payload) {
    // Add 'payload' to some state value.
  });
});

// Create a custom action that invokes a dispatch with contextual data.
flux.createActions('MyActions', function() {
  add: flux.actionWithContext('update', {mode: 'addition'}, function() {
    return 5;
  });
});
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  
**Returns**: <code>function</code> - Proxy method that updates callback dispatch to include
                   contextual data.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Reference to key specified in store. |
| context | <code>Object.&lt;string, (string\|number)&gt;</code> | Qualifying parameters for action context. |
| callback | <code>function</code> | Action body or logic. |

<a name="Flux+createActions"></a>
### flux.createActions(group, actions)
Entry point for creating a group of actions.

*Example:*
```
// Create a custom action.
flux.createActions('MyActions', function() {
  addValue: function(payload) {
    return payload;
  });
});

// Invoke the action 'addValue'.
flux.actions('MyActions').addValue(5);
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  

| Param | Type | Description |
| --- | --- | --- |
| group | <code>string</code> | Identifier for the set of actions. |
| actions | <code>Object.&lt;string, function()&gt;</code> | The set of actions. |

<a name="Flux+createStore"></a>
### flux.createStore(name, definition)
Entry point for creating a store.

*Example:*
```
// Create a store with an event that listens for contextual data.
flux.createStore('MyStore', {
  initialize: function() {
    return {
      value: 0
    };
  },
  increment: function(payload) {
    this.set('value', this.state.value + payload);
  }
});
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name to use when identifying the store. |
| definition | <code>Object.&lt;string, function()&gt;</code> | The specification for the store containing                            events and configurations. |

<a name="Flux+createTemplate"></a>
### flux.createTemplate(template, definition) ⇒ <code>Template</code>
Uses a template in a store. Templates make it easier to define store
behavior by applying custom logic to an event.

*Example:*
```
// Create backbone model that Flux.Ajax can utilize for making web requests.
var Accounts = Backbone.Model.extend({
  setUrl: function() {
    this.url = 'getAccounts';
  }
});

// Create a store that uses the Flux.Ajax template. This template can be
// used to perform GET and POST requests.
flux.createStore('MyStore', {
  searchAccounts: flux.createTemplate(Flux.Ajax, {
    // Use the backbone model defined above.
    model: Accounts,
    // Event hooks for applying additonal custom behavior.
    onInit: function() {},
    onSuccess: function(payload) {
      // When request sucessfully completes, can perform custom logic.
      console.log(payload);
    },
    onFail: function(payload) {
      // When request fails to complete, can perform custom logic.
      console.log(payload);
    }
  })
});

// The store maintains an internal state for the template that is
// structured within the store like this:
> console.log(this.state.searchAccounts)
{
  model: Accounts,
  status: ACTION.UNINITIALIZED,
  error: null,
  errorType: null
}

// The template state can then be retrieved in a React component.
React.createClass({
  // Tells the compenont to which stores it should listen.
  mixins: [flux.setStores('MyStore')],

  // We manage the state of the component. Parameter 'states' is an
  // object containing the state of each store to which the component is
  // listening.
  syncStores: function(states) {
    console.log(states.MyStore.searchAccounts);
    this.setState(states);
  },

  render: function() {
    return null;
  }
}
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  
**Returns**: <code>Template</code> - An instantiated instance of the template.  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>Template</code> | A subclass of Template definining the logic of                            the template. |
| definition | <code>Object</code> | Templates expose hooks that allow for                            customization. See template for outline of                            available hooks. |

<a name="Flux+dispatch"></a>
### flux.dispatch(dispatchKey, data)
Dispatch an event from an action that stores listen to and consume.

*Example:*
```
// Create a custom action and then use 'this.dispatch' to asynchronously
// invoke a custom action.
flux.createActions('MyActions', function() {
  // Sometimes it makes sense to asynchronously invoke a dispatch. In this
  // situation use this.dispatch to invoke the dispatch.
  delayAdd: function(payload) {
    setTimeout(function() {
      // Using what's exposed on the method context.
      this.dispatch('addValue', payload);
      // Using Flux directly.
      Flux.dispatch(new DispatchKey('MyActions', payload));
    }, 2000);
  }
});

// Invoke the action 'delayValue'.
flux.actions('MyActions').delayValue(5);
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  

| Param | Type | Description |
| --- | --- | --- |
| dispatchKey | <code>DispatchKey</code> | The dispatch identifier. |
| data | <code>any</code> | Dispatch payload that is often an {Object}. |

<a name="Flux+getStore"></a>
### flux.getStore(name) ⇒ <code>Object</code>
Retrieves the state of a store by name.

*Example:*
```
// Create a store.
flux.createStore('MyStore', {
  // Access another store and use that data in this store.
  copyValue() {
    var copy = flux.getStore('SecondaryStore').secondaryValue;
    ...
  }
});
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  
**Returns**: <code>Object</code> - The state of the store.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the store. |

<a name="Flux+listenTo"></a>
### flux.listenTo(context, callback) ⇒ <code>function</code>
Helper method for stores used for filtering dispatches by context.

*Example:*
```
// Create a store with an event that listens for contextual data.
flux.createStore('MyStore', {
  update: flux.listenTo({mode: 'addition'}, function(payload) {
    // Add 'payload' to some state value.
  });
});

// Create a custom action that invokes a dispatch with contextual data.
flux.createActions('MyActions', function() {
  add: flux.actionWithContext('update', {mode: 'addition'}, function() {
    return 5;
  });
});
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  
**Returns**: <code>function</code> - Proxy for callback that implements context filtering.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object.&lt;string, (string\|number)&gt;</code> | The context by which the                                         event should be filtered. |
| callback | <code>function</code> | Method to execute if context matches the                            context of the dispatch. |

<a name="Flux+setStores"></a>
### flux.setStores(args) ⇒ <code>Object.&lt;string, function()&gt;</code>
Helper utility enabling components to listen to updates from stores by
returning React mixin that's added to the component.

*Example:*
```
// Create React component and then set a store on the component.
React.createClass({
  // Tells the compenont to which stores it should listen.
  mixins: [flux.setStores('MyStore')],

  syncStores: function(states) {
    ...
  },

  render: function() {
    ...
  }
}
```

**Kind**: instance method of <code>[Flux](#Flux)</code>  
**Returns**: <code>Object.&lt;string, function()&gt;</code> - Store hooks for react components.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array.&lt;string&gt;</code> | A list of store names. |
