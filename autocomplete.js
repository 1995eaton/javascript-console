var Autocomplete = {};
var log;
log = console.log.bind(console);

Autocomplete.methods = {
  string: String,
  function: Function,
  object: Object,
  array: Array,
  number: Number
};

Array.prototype.unique = function() {
  var a = [];
  for (var i = 0, l = this.length; i < l; ++i) {
    if (a.indexOf(this[i]) === -1) {
      a.push(this[i]);
    }
  }
  return a;
};

Autocomplete.getProperties = function(input) {
  var type = typeof input;
  if (input === null || !type) {
    return [];
  }
  var methods = [];
  if (type === "object") {
    if (Array.isArray(input)) {
      type = "array";
    }
    for (var key in input) {
      methods.push(key);
    }
  }
  var propertyName = this.methods[type];
  if (type !== "string" && (/^(object|function)$/.test(type) || (input !== window && this.getProperties(window).indexOf(input) !== -1))) {
    methods = methods.concat(Object.getOwnPropertyNames(input));
  }
  if (propertyName) {
    if (Object.getOwnPropertyNames(propertyName).indexOf("prototype") !== -1) {
      methods = methods.concat(Object.getOwnPropertyNames(propertyName.prototype));
      if (Array.isArray(input)) {
        methods = methods.slice(input.length);
      }
    }
    methods = methods.concat(Object.getOwnPropertyNames(Object.prototype));
  }
  return methods.filter(function(e) {
    return e && !/^\d+$/.test(e);
  }).unique().sort();
};

Autocomplete.matchInput = function(method, match) {
  var properties = this.getProperties(method);
  var matches = [];
  for (var i = 0, l = properties.length; i < l; ++i) {
    if (properties[i].indexOf(match) === 0) {
      matches.push(properties[i]);
    }
  }
  return matches;
};

Autocomplete.complete = function(input) {
  var i, l;
  if (!input || typeof input !== "string" || input.indexOf("..") !== -1) {
    return "";
  }
  var windowProperties = this.getProperties(window).concat(
      ["instanceof", "function", "var", "new", "else", "with", "typeof", "null", "if", "while", "for", "do", "in"]
  );
  input = input.replace(/.*[^.a-zA-Z0-9_]/, "");
  if (!input.replace(/\.+/, "").trim() || input.split(/[^.a-zA-Z0-9_]+/).slice(-2, -1)[0] === "var") {
    return "";
  }
  if (input.indexOf(".") !== -1) {
    var properties = input.replace(/\.$/, "").split(".").filter(function(e) { return e; });
    if (properties.length > 1) {
      if (windowProperties.indexOf(properties[0]) === -1) {
        return "";
      }
      var currentMethod = window[properties[0]];
      if (!this.methods[typeof currentMethod]) {
        return "";
      }
      for (i = 1, l = properties.length; i < l; ++i) {
        if (!currentMethod[properties[i]]) {
          return this.matchInput(currentMethod, properties[i]);
        } else if (i + 1 >= properties.length) {
          if (input.slice(-1) === ".") {
            return this.getProperties(currentMethod[properties[i]]);
          }
          return this.matchInput(currentMethod, properties[i]);
        }
        currentMethod = currentMethod[properties[i]];
      }
      return (input.slice(-1) === "." ? this.getProperties(currentMethod) : "");
    } else {
      properties = properties[0];
    }
    return (input.slice(-1) === "." ? this.getProperties(window[properties]) : "");
  } else {
    var _ret = [];
    for (i = 0, l = windowProperties.length; i < l; ++i) {
      if (windowProperties[i].indexOf(input) === 0) {
        _ret.push(windowProperties[i]);
      }
    }
    return _ret.sort();
  }
};
