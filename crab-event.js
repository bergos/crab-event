'use strict';

(function (root, factory) {
  var crab = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = crab;
  } else {
    root.Event = crab.Event;
    root.Events = crab.Events;
  }
})(this, function () {
  var createAlternatives = function (methods, obj) {
    for (var method in methods) {
      methods[method].forEach(function (alternative) {
        obj[alternative] = obj[method];
      });
    }
  };

  var findMethod = function (method, methods, obj) {
    if (method in obj) {
      return obj[method];
    }

    for (var i=0; i<methods[method].length; i++) {
      if (methods[method][i] in obj) {
        return obj[methods[method][i]];
      }
    }

    throw 'method "' + method + '" or alternatives not found in object';
  };

  var Event = function () {
    createAlternatives(Event.options.methods, this);
  };

  Event.prototype.listeners = function () {
    return (this._listeners = this._listeners || []);
  };

  Event.prototype._addEventListener = function (listener) {
    this.listeners().push(listener);
  };

  Event.prototype._removeEventListener = function (listener) {
    var
      index = this.listeners().indexOf(listener);

    if (index < 0) {
      return;
    }

    this._listeners.splice(index, 1);
  };

  Event.prototype._once = function (listener) {
    var self = this;

    var remover = function () {
      self._removeEventListener(listener);
      self._removeEventListener(remover);
    };

    self._addEventListener(listener);
    self._addEventListener(remover);
  };

  Event.prototype._dispatchEvent = function () {
    var
      self = this,
      current = 0,
      parameters = Array.prototype.slice.call(arguments);

    // create a copy of listeners, so we don't get into trouble if the list changes
    var listeners = self.listeners().slice();

    return new Promise(function (resolve, reject) {
      var next = function () {
        var listener = null;

        // loop until we found a listener that wasn't removed in the meantime
        do {
          listener = listeners[current++];
        } while(listeners.indexOf(listener) < 0 && current < listeners.length);

        // resolve if no further listener was found
        if (!listener) {
          return resolve();
        }

        // use callback api if listener has more parameters than dispatched
        if (listener.length > parameters.length) {
          try {
            listener.apply(self, parameters.concat([next]));
          } catch (error) {
            return reject(error);
          }
        } else {
          Promise.resolve()
            .then(function () {
              return listener.apply(self, parameters);
            })
            .then(function () {
              next();
            })
            .catch(function (error) {
              return reject(error);
            });
        }
      };

      next();
    });
  };

  Event.mixin = function (target) {
    if (typeof target === 'function') {
      Object.keys(Event.prototype).forEach(function (property) {
        target.prototype[property] = Event.prototype[property];
      });

      createAlternatives(Event.options.methods, target.prototype);
    } else {
      Object.keys(Event.prototype).forEach(function (property) {
        target[property] = Event.prototype[property];
      });

      createAlternatives(Event.options.methods, target);
    }
  };

  var Events = function () {
    createAlternatives(Event.options.methods, this);
  };

  Events.prototype.events = function () {
    return (this._events = this._events || {});
  };

  Events.prototype._addEventListener = function (topic, listener) {
    if (!(topic in this.events())) {
      this.events()[topic] = new Event();
    }

    this.events()[topic]._addEventListener(listener);
  };

  Events.prototype._removeEventListener = function (topic, listener) {
    if (!(topic in this.events())) {
      return;
    }

    this.events()[topic]._removeEventListener(listener);

    if (this.events()[topic].listeners().length === 0) {
      delete this.events()[topic];
    }
  };

  Events.prototype._once = function (topic, listener) {
    var self = this;

    var remover = function () {
      self._removeEventListener(topic, listener);
      self._removeEventListener(topic, remover);
    };

    self._addEventListener(topic, listener);
    self._addEventListener(topic, remover);
  };

  Events.prototype._dispatchEvent = function (topic) {
    var
      event,
      parameters = Array.prototype.slice.call(arguments, 1);

    if (!(topic in this.events())) {
      return Promise.resolve();
    }

    event = this.events()[topic];

    return event._dispatchEvent.apply(event, parameters);
  };

  Events.mixin = function (target) {
    if (typeof target === 'function') {
      Object.keys(Events.prototype).forEach(function (property) {
        target.prototype[property] = Event.prototype[property];
      });

      createAlternatives(Event.options.methods, target.prototype);
    } else {
      Object.keys(Events.prototype).forEach(function (property) {
        target[property] = Event.prototype[property];
      });

      createAlternatives(Event.options.methods, target);
    }
  };

  var EventBinding = function (events, topic) {
    this._events = events;
    this._topic = topic;

    createAlternatives(Event.options.methods, this);
  };

  EventBinding.prototype._addEventListener = function (listener) {
    findMethod('_addEventListener', Event.options.methods, this._events)
      .call(this._events, this._topic, listener);
  };

  EventBinding.prototype._removeEventListener = function (listener) {
    findMethod('_removeEventListener', Event.options.methods, this._events)
      .call(this._events, this._topic, listener);
  };

  EventBinding.prototype._dispatchEvent = function () {
    return findMethod('_dispatchEvent', Event.options.methods, this._events)
      .apply(this._events, [this._topic].concat(Array.prototype.slice.call(arguments)));
  };

  Event.bindTo = function (events, topic) {
    return new EventBinding(events, topic);
  };

  Event.options = {};

  Event.options.methods = {
    _addEventListener: ['on'],
    _removeEventListener: ['off'],
    _once: ['once'],
    _dispatchEvent: ['trigger']
  };

  return {
    Event: Event,
    Events: Events
  };
});