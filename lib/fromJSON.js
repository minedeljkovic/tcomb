var assert = require('./assert');
var isFunction = require('./isFunction');
var isNil = require('./isNil');
var getTypeName = require('./getTypeName');
var isObject = require('./isObject');
var isArray = require('./isArray');
var isType = require('./isType');
var create = require('./create');
var assign = require('./assign');

function assignMany(values) {
  return values.reduce(function (acc, v) {
    return assign(acc, v);
  }, {});
}

function fromJSON(value, type, path) {
  if (process.env.NODE_ENV !== 'production') { // leave optimization
    assert(isFunction(type), function () {
      return 'Invalid argument type ' + assert.stringify(type) + ' supplied to fromJSON(value, type) (expected a type)';
    });    
  }
  path = path || [getTypeName(type)]; // build path in production

  if (isFunction(type.fromJSON)) {
    return create(type, type.fromJSON(value), path);
  }

  if (!isType(type)) {
    return value instanceof type ? value : new type(value);
  }

  var kind = type.meta.kind;
  var k;
  var ret;

  switch (kind) {

    case 'maybe' :
      return isNil(value) ? null : fromJSON(value, type.meta.type, path);

    case 'subtype' : // the kind of a refinement is 'subtype' (for legacy reasons)
      ret = fromJSON(value, type.meta.type, path);
      if (true) { // remove optimization
        assert(type.meta.predicate(ret), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected a valid ' + getTypeName(type) + ')';
        });
      }
      return ret;

    case 'struct' :
      if (true) { // remove optimization
        assert(isObject(value), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected an object for type ' + getTypeName(type) + ')';
        });
      }
      var props = type.meta.props;
      ret = {};
      for (k in props) {
        if (props.hasOwnProperty(k)) {
          ret[k] = fromJSON(value[k], props[k], ( true ? path.concat(k + ': ' + getTypeName(props[k])) : null )); // remove optimization
        }
      }
      return new type(ret);

    case 'interface' :
      if (true) { // remove optimization
        assert(isObject(value), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected an object)';
        });
      }
      var interProps = type.meta.props;
      ret = {};
      for (k in interProps) {
        if (interProps.hasOwnProperty(k)) {
          ret[k] = fromJSON(value[k], interProps[k], ( true ? path.concat(k + ': ' + getTypeName(interProps[k])) : null )); // remove optimization
        }
      }
      return ret;

    case 'list' :
      if (true) { // remove optimization
        assert(isArray(value), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected an array for type ' + getTypeName(type) + ')';
        });
      }
      var elementType = type.meta.type;
      var elementTypeName = getTypeName(elementType);
      return value.map(function (element, i) {
        return fromJSON(element, elementType, ( true ? path.concat(i + ': ' + elementTypeName) : null )); // remove optimization
      });

    case 'union' :
      var actualType = type.dispatch(value);
      if (true) { // remove optimization
        assert(isFunction(actualType), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (no constructor returned by dispatch of union ' + getTypeName(type) + ')';
        });
      }
      return fromJSON(value, actualType, path);

    case 'tuple' :
      if (true) { // remove optimization
        assert(isArray(value), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected an array for type ' + getTypeName(type) + ')';
        });
      }
      var types = type.meta.types;
      if (true) { // remove optimization
        assert(isArray(value) && value.length === types.length, function () {
          return 'Invalid value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected an array of length ' + types.length + ' for type ' + getTypeName(type) + ')';
        });
      }
      return value.map(function (element, i) {
        return fromJSON(element, types[i], ( true ? path.concat(i + ': ' + getTypeName(types[i])) : null )); // remove optimization
      });

    case 'dict' :
      if (true) { // remove optimization
        assert(isObject(value), function () {
          return 'Invalid argument value ' + assert.stringify(value) + ' supplied to fromJSON(value, type) (expected an object for type ' + getTypeName(type) + ')';
        });
      }
      var domain = type.meta.domain;
      var codomain = type.meta.codomain;
      var domainName = getTypeName(domain);
      var codomainName = getTypeName(codomain);
      ret = {};
      for (k in value) {
        if (value.hasOwnProperty(k)) {
          ret[domain(k, ( true ? path.concat(domainName) : null ))] = fromJSON(value[k], codomain, ( true ? path.concat(k + ': ' + codomainName) : null )); // remove optimization
        }
      }
      return ret;

    case 'intersection' :
      var values = type.meta.types.map(function (type, i) {
        return fromJSON(value, type, ( true ? path.concat(i + ': ' + getTypeName(type)) : null )); // remove optimization
      });
      return type(
        isObject(values[0]) ? assignMany(values) : value,
        path
      );

    default : // enums, irreducible
      return type(value, path);
  }
}

module.exports = fromJSON;
