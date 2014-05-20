var Autocomplete = {};
var log;
log = console.log.bind(console);

Autocomplete.methods = {
  string: String,
  function: Function,
  object: Object,
  array: Array,
  number: Number,
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
  if (input === null) {
    return [];
  }
  var type = typeof input;
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
  if (type === "object" || type === "function" || (input !== window && this.getProperties(window).indexOf(input) !== -1)) {
    methods = methods.concat(Object.getOwnPropertyNames(input));
  }
  if (type === "object" || type === "function" || type === "number" || type === "array") {
    if (Object.getOwnPropertyNames(propertyName).indexOf("prototype") !== -1) {
      methods = methods.concat(Object.getOwnPropertyNames(propertyName.prototype));
      if (Array.isArray(input)) {
        methods = methods.slice(input.length);
      }
    }
  }
  return methods.filter(function(e) {
    return e && !/^\d+$/.test(e);
  }).unique().sort();
};

Autocomplete.complete = function(input) {
  if (!input || typeof input !== "string") {
    return "";
  }
  var all = input.split(/[^.a-zA-Z0-9_]+/);
  input = input.replace(/.*[^.a-zA-Z0-9_]/, "");
  if (!input.replace(/\.+/, "").trim() || all.slice(-2, -1)[0] === "var") return "";
  if (input.indexOf(".") !== -1) {
    var propertyTest = input.replace(/\.$/, "").split(".").filter(function(e) { return e; });
    if (propertyTest.length > 1) {
      if (Object.getOwnPropertyNames(window).indexOf(propertyTest[0]) === -1) {
        return "";
      }
      var cur = propertyTest[0];
      if (this.getProperties(window).indexOf(propertyTest[0]) === -1) {
        return "";
      }
      var curMeth = window[propertyTest[0]];
      for (var i = 1; i < propertyTest.length; ++i) {
        if (!curMeth[propertyTest[i]]) {
          var p = this.getProperties(curMeth);
          var matches = [];
          for (var j = 0; j < p.length; ++j) {
            if (p[j].indexOf(propertyTest[i]) === 0) {
              matches.push(p[j]);
            }
          }
          if (matches.length) {
            return matches;
          }
          return "";
        } else if (i + 1 >= propertyTest.length) {
          if (input.slice(-1) === ".") {
            return this.getProperties(curMeth[propertyTest[i]]);
          }
          var p = this.getProperties(curMeth);
          var matches = [];
          for (var j = 0; j < p.length; ++j) {
            if (p[j].indexOf(propertyTest[i]) === 0) {
              matches.push(p[j]);
            }
          }
          if (matches.length) {
            return matches;
          }
        }
        cur += "." + propertyTest[i];
        curMeth = curMeth[propertyTest[i]];
      }
      if (input.slice(-1) === ".") {
        return this.getProperties(curMeth);
      } else {
        return "";
      }
    } else {
      propertyTest = propertyTest[0];
    }
    if (input.slice(-1) === ".") {
      return this.getProperties(window[propertyTest]);
    } else {
      return "";
    }
  } else {
    var windowKeys = this.getProperties(window).concat(
        ["instanceof", "function", "new", "typeof", "null", "print", "if", "while", "for", "do", "in"]
    );
    var _ret = [];
    for (var i = 0, l = windowKeys.length; i < l; ++i) {
      if (windowKeys[i].indexOf(input) === 0) {
        _ret.push(windowKeys[i]);
      }
    }
    return _ret.sort();
  }
};
