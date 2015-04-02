'use strict';

global.Promise = require('es6-promise').Promise;

var
  assert = require('assert'),
  crab = require('../crab-event'),
  Event = crab.Event,
  Events = crab.Events;


describe('Event', function () {
  it('should mixin into prototype', function () {
    var
      test = function () {};

    test.prototype.test = function () {};

    Event.mixin(test);

    assert.notEqual(test.prototype.test, null);
    assert.notEqual(test.prototype.on, null);
    assert.notEqual(test.prototype.off, null);
    assert.notEqual(test.prototype.trigger, null);
  });

  it('should mixin into existing object', function () {
    var
      test = { test: function () {} };

    Event.mixin(test);

    assert.notEqual(test.test, null);
    assert.notEqual(test.on, null);
    assert.notEqual(test.off, null);
    assert.notEqual(test.trigger, null);
  });

  it('should add listener', function () {
    var
      test = new Event();

    test.on(function () {});
  });

  it('should remove listener', function () {
    var
      test = new Event(),
      func = function () {};

    test.on(func);

    test.off(func);
  });

  it('should ignore remove not registered listener', function () {
    var
      test = new Event(),
      func = function () {};

    test.off(func);
  });

  it('should handle sync listener', function (done) {
    var
      test = new Event(),
      processed = false;

    test.on(function () { processed = true; });

    test.trigger()
      .then(function () { assert(processed) })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should ignore emit without listener', function (done) {
    var
      test = new Event();

    test.trigger()
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should handle async Promise listener', function (done) {
    var
      test = new Event(),
      processed = false;

    test.on(function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          processed = true;

          resolve();
        }, 10);
      });
    });

    test.trigger()
      .then(function () { assert(processed) })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should handle async callback listener', function (done) {
    var
      test = new Event(),
      processed = false;

    test.on(function (callback) {
      setTimeout(function () {
        processed = true;

        callback();
      }, 10);
    });

    test.trigger()
      .then(function () { assert(processed) })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should handle error in sync listener', function (done) {
    var
      test = new Event();

    test.on(function () {
      null.toString();
    });

    test.trigger()
      .then(function () { done('reached resolve branch'); })
      .catch(function (error) { done(); });
  });

  it('should handle error in async callback listener', function (done) {
    var
      test = new Event();

    test.on(function (callback) {
      null.toString();
    });

    test.trigger()
      .then(function () { done('reached resolve branch'); })
      .catch(function (error) { done(); });
  });

  it('should handle once listener only once', function () {
    var
      test = new Event(),
      counter = 0;

    test.once(function () {
      counter++;
    });

    test.trigger()
      .then(function () { test.trigger(); })
      .then(function () { assert(counter === 1); })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });
});


describe('Events', function () {
  it('should mixin into prototype', function () {
    var
      test = function () {};

    test.prototype.test = function () {};

    Events.mixin(test);

    assert.notEqual(test.prototype.test, null);
    assert.notEqual(test.prototype.on, null);
    assert.notEqual(test.prototype.off, null);
    assert.notEqual(test.prototype.trigger, null);
  });

  it('should mixin into existing object', function () {
    var
      test = { test: function () {} };

    Events.mixin(test);

    assert.notEqual(test.test, null);
    assert.notEqual(test.on, null);
    assert.notEqual(test.off, null);
    assert.notEqual(test.trigger, null);
  });

  it('should add listener', function () {
    var
      test = new Events();

    test.on('test', function () {});
  });

  it('should create a single Event instance for multiple listeners', function () {
    var
      test = new Events();

    test.on('test', function () {});
    test.on('test', function () {});

    assert.deepEqual(Object.keys(test.events()), ['test']);
  });

  it('should remove listener', function () {
    var
      test = new Events(),
      func = function () {};

    test.on('test', func);

    test.off('test', func);
  });

  it('should keep event if a listener ist left', function () {
    var
      test = new Events(),
      func = function () {};

    test.on('test', func);
    test.on('test', function () {});

    test.off('test', func);

    assert.deepEqual(Object.keys(test.events()), ['test']);
  });

  it('should ignore remove on not registered listener', function () {
    var
      test = new Events(),
      func = function () {};

    test.off('test', func);
  });

  it('should handle sync listener', function (done) {
    var
      test = new Events(),
      processed = false;

    test.on('test', function () { processed = true; });

    test.trigger('test')
      .then(function () { assert(processed) })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should ignore emit without listener', function (done) {
    var
      test = new Events();

    test.trigger('test')
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should handle async Promise listener', function (done) {
    var
      test = new Events(),
      processed = false;

    test.on('test', function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          processed = true;

          resolve();
        }, 10);
      });
    });

    test.trigger('test')
      .then(function () { assert(processed) })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should handle async callback listener', function (done) {
    var
      test = new Events(),
      processed = false;

    test.on('test', function (callback) {
      setTimeout(function () {
        processed = true;

        callback();
      }, 10);
    });

    test.trigger('test')
      .then(function () { assert(processed) })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should handle once listener only once', function () {
    var
      test = new Events(),
      counter = 0;

    test.once('test', function () {
      counter++;
    });

    test.trigger('test')
      .then(function () { test.trigger('test'); })
      .then(function () { assert(counter === 1); })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });
});


describe('EventBinding', function () {
  it('should bind to a single event of an Events object', function (done) {
    var
      events = new Events(),
      event = Event.bindTo(events, 'test'),
      calls = 0;

    event.on(function (data) {
      assert.equal(data, 'data');
      calls++;
    });

    events.on('test', function (data) {
      assert.equal(data, 'data');
      calls++;
    });

    event.trigger('data')
      .then(function () { return events.trigger('test', 'data'); })
      .then(function () { assert.equal(calls, 4); })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should bind to a single event of an non crab Events object', function (done) {
    var NonCrabEvents = function () {
      this.listeners = [];
    };

    NonCrabEvents.prototype.on = function (topic, listeners) {
      this.listeners.push(listeners);
    }

    NonCrabEvents.prototype.trigger = function (topic, data) {
      return Promise.all(this.listeners.map(function (listener) {
        return Promise.resolve()
          .then(function () { return listener(data); });
      }));
    };

    var
      events = new NonCrabEvents(),
      event = Event.bindTo(events, 'test'),
      calls = 0;

    event.on(function (data) {
      assert.equal(data, 'data');
      calls++;
    });

    events.on('test', function (data) {
      assert.equal(data, 'data');
      calls++;
    });

    event.trigger('data')
      .then(function () { return events.trigger('test', 'data'); })
      .then(function () { assert.equal(calls, 4); })
      .then(function () { done(); })
      .catch(function (error) { done(error); });
  });

  it('should throw an error if non crab Events object uses unknown methods', function (done) {
    var NonCrabEvents = function () {};

    var
      errorThrown = false;

    try {
      var
        events = new NonCrabEvents(),
        event = Event.bindTo(events, 'test');

      event.on('test', function () {});
    } catch (error) {
      errorThrown = true;
    }

    if (!errorThrown) {
      done('no error thrown');
    } else {
      done();
    }
  });

  it('should remove listener', function () {
    var
      events = new Events(),
      event = Event.bindTo(events, 'test'),
      func = function () {};

    event.on('test', func);

    event.off('test', func);
  });
});