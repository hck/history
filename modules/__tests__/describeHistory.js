import assert from 'assert';
import expect from 'expect';
import NavigationTypes from '../NavigationTypes';

function describeHistory(createHistory) {
  describe('when the user confirms a transition', function () {
    var confirmationMessage, location, history, unlisten;
    beforeEach(function () {
      location = null;
      confirmationMessage = 'Are you sure?';

      history = createHistory({
        getUserConfirmation(message, callback) {
          expect(message).toBe(confirmationMessage);
          callback(true);
        }
      });

      history.registerTransitionHook(function () {
        return confirmationMessage;
      });

      unlisten = history.listen(function (loc) {
        location = loc;
      });
    });

    afterEach(function () {
      if (unlisten)
        unlisten();
    });

    it('updates the location', function () {
      var initialLocation = location;
      history.pushState({ the: 'state' }, '/home?the=query');
      expect(initialLocation).toNotBe(location);

      assert(location);
      assert(location.key);
      expect(location.state).toEqual({ the: 'state' });
      expect(location.pathname).toEqual('/home');
      expect(location.search).toEqual('?the=query');
      expect(location.navigationType).toEqual(NavigationTypes.PUSH);
    });
  });

  describe('when the user cancels a transition', function () {
    var confirmationMessage, location, history, unlisten;
    beforeEach(function () {
      location = null;
      confirmationMessage = 'Are you sure?';

      history = createHistory({
        getUserConfirmation(message, callback) {
          expect(message).toBe(confirmationMessage);
          callback(false);
        }
      });

      history.registerTransitionHook(function () {
        return confirmationMessage;
      });

      unlisten = history.listen(function (loc) {
        location = loc;
      });
    });

    afterEach(function () {
      if (unlisten)
        unlisten();
    });

    it('does not update the location', function () {
      var initialLocation = location;
      history.pushState(null, '/home');
      expect(initialLocation).toBe(location);
    });
  });

  describe('pushState', function () {
    var location, history, unlisten;
    beforeEach(function () {
      location = null;
      history = createHistory();
      unlisten = history.listen(function (loc) {
        location = loc;
      });
    });

    afterEach(function () {
      if (unlisten)
        unlisten();
    });

    it('calls change listeners with the new location', function () {
      history.pushState({ the: 'state' }, '/home?the=query');

      assert(location);
      assert(location.key);
      expect(location.state).toEqual({ the: 'state' });
      expect(location.pathname).toEqual('/home');
      expect(location.search).toEqual('?the=query');
      expect(location.navigationType).toEqual(NavigationTypes.PUSH);
    });
  });

  describe('replaceState', function () {
    var location, history, unlisten;
    beforeEach(function () {
      location = null;
      history = createHistory();
      unlisten = history.listen(function (loc) {
        location = loc;
      });
    });

    afterEach(function () {
      if (unlisten)
        unlisten();
    });

    it('calls change listeners with the new location', function () {
      history.replaceState({ more: 'state' }, '/feed?more=query');

      assert(location);
      assert(location.key);
      expect(location.state).toEqual({ more: 'state' });
      expect(location.pathname).toEqual('/feed');
      expect(location.search).toEqual('?more=query');
      expect(location.navigationType).toEqual(NavigationTypes.REPLACE);
    });
  });

  describe.skip('goBack', function () {
    var history, unlisten;
    beforeEach(function () {
      history = createHistory();
    });

    afterEach(function () {
      if (unlisten)
        unlisten();
    });

    it('calls change listeners with the previous location', function (done) {
      var initialLocation;
      var steps = [
        function (location) {
          initialLocation = location;
          history.pushState({ the: 'state' }, '/two?a=query');
        },
        function (location) {
          expect(location.state).toEqual({ the: 'state' });
          expect(location.pathname).toEqual('/two');
          expect(location.search).toEqual('?a=query');
          history.goBack();
        },
        function (location) {
          expect(initialLocation).toEqual(location);
          done();
        }
      ];

      function execNextStep() {
        try {
          steps.shift().apply(this, arguments);
        } catch (error) {
          done(error);
        }
      }

      unlisten = history.listen(execNextStep);
    });
  });
}

export default describeHistory;