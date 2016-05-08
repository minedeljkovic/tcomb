/* globals describe, it */
var assert = require('assert');
var t = require('../index');
var throwsWithMessage = require('./util').throwsWithMessage;

var Point = t.struct({
  x: t.Number,
  y: t.Number
});

describe('t.struct(props, [name])', function () {

  describe('combinator', function () {

    it('should throw if used with wrong arguments', function () {

      throwsWithMessage(function () {
        t.struct();
      }, '[tcomb] Invalid argument props undefined supplied to struct(props, [name]) combinator (expected a dictionary String -> Type)');

      throwsWithMessage(function () {
        t.struct({a: null});
      }, '[tcomb] Invalid argument props {\n  "a": null\n} supplied to struct(props, [name]) combinator (expected a dictionary String -> Type)');

      throwsWithMessage(function () {
        t.struct({}, 1);
      }, '[tcomb] Invalid argument name 1 supplied to struct(props, [name]) combinator (expected a string)');

    });

  });

  describe('constructor', function () {

    it('should be idempotent', function () {
      var T = Point;
      var p1 = T({x: 0, y: 0});
      var p2 = T(p1);
      assert.deepEqual(Object.isFrozen(p1), true);
      assert.deepEqual(Object.isFrozen(p2), true);
      assert.deepEqual(p2 === p1, true);
    });

    it('should accept only valid values', function () {
      throwsWithMessage(function () {
        Point(1);
      }, '[tcomb] Invalid value 1 supplied to Struct{x: Number, y: Number} (expected an object)');
      throwsWithMessage(function () {
        Point({});
      }, '[tcomb] Invalid value undefined supplied to Struct{x: Number, y: Number}/x: Number');
    });

  });

  describe('#is(x)', function () {

    it('should return true when x is an instance of the struct', function () {
      var p = new Point({ x: 1, y: 2 });
      assert.ok(Point.is(p));
    });

  });

  describe('#update()', function () {

    var Type = t.struct({name: t.String});
    var instance = new Type({name: 'Giulio'});

    it('should return a new instance', function () {
      var newInstance = Type.update(instance, {name: {$set: 'Canti'}});
      assert.ok(Type.is(newInstance));
      assert.deepEqual(instance.name, 'Giulio');
      assert.deepEqual(newInstance.name, 'Canti');
    });

  });

});
