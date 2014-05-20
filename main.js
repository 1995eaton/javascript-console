document.addEventListener("DOMContentLoaded", function() {
  var input = document.getElementById("input");
  var results = document.getElementById("results");
  input.focus();
  var cindex = -1;
  var lastTyped = "";
  var _res = [];
  var his = [];
  var hind = 0;
  input.addEventListener("keydown", function(ev) {
    if (his.length) {
      if (ev.which === 38 && hind > 0) {
        ev.preventDefault();
        hind -= 1;
        input.value = his[hind];
        input.select();
        return document.getSelection().collapseToEnd();
      } else if (ev.which === 40 && hind + 1 < his.length) {
        ev.preventDefault();
        hind += 1;
        input.value = his[hind];
        input.select();
        return document.getSelection().collapseToEnd();
      } else if (ev.which === 40) {
        input.value = lastTyped;
      }
    }
    if (ev.which === 38 || ev.which === 40) {
      ev.preventDefault();
      input.select();
      document.getSelection().collapseToEnd();
    }
    if (ev.which === 9) {
      ev.preventDefault();
      if (!_res.length) {
        return;
      }
      if (cindex !== -1) {
        results.children[cindex].style.backgroundColor = "";
      }
      cindex += (ev.shiftKey ? -1 : 1);
      if (cindex < 0) {
        cindex = _res.length - 1;
        if (input.value !== lastTyped) {
          cindex = -1;
          return input.value = lastTyped;
        }
      }
      if (cindex >= _res.length) {
        cindex = -1;
        if (input.value !== lastTyped) {
          return input.value = lastTyped;
        }
      }
      results.children[cindex].style.backgroundColor = "#bbb";
      window.setTimeout(function() {
        var first = input.value.match(/.*[ \(\){},:;]/);
        if (first) {
          first = first[0];
        } else {
          first = "";
        }
        var i = input.value.replace(/.*[ \(\){},:;]/, "");
        if (/\.[a-zA-Z0-9]*$/.test(i)) {
          input.value = first + i.replace(/\.[^.]*$/, "") + "." + _res[cindex];
        } else {
          input.value = first + _res[cindex];
        }
      }, 0);
      return;
    } else if (ev.which > 40 || ev.which === 8) {
      window.setTimeout(function() {
        results.innerHTML = "";
        results.style.display = "none";
        lastTyped = input.value;
        _res = Autocomplete.complete(input.value);
        results.innerHTML = "";
        results.style.display = "none";
        if (!_res || !_res.length) {
          return;
        }
        results.style.display = "block";
        cindex = -1;
        results.innerHTML = _res.map(function(e) { return "<div>" + e + "</div>"; }).join("");
      }, 0);
    } else if (ev.which === 13) {
      window.setTimeout(function() {
        his.push(input.value);
        hind = his.length;
        _res = [];
        cindex = -1;
        results.style.display = "none";
        var v = input.value;
        input.value = "";
        var out;
        try {
          out = window.eval.call(window, v);
          if (Array.isArray(out)) {
            out = "[" + out.join(", ") + "]";
          } else if (typeof out === "object" && out !== null) {
            out = "{" + Object.keys(out).filter(function(e) {
              return typeof out[e] !== "function";
            }).slice(0, 5).map(function(e) {
              return e + ": " + out[e];
            }).join(", ") + (typeof out === "object" && Object.keys(out).length > 5 ? "..." : "") + "}";
          }
          document.getElementById("output").innerText += "\n" + out;
        } catch (e) {
          document.getElementById("output").innerText += "\n" + e;
        }
      }, 0);
    } else if (ev.which === 32) {
      _res = [];
      cindex = -1;
      results.style.display = "none";
    }
  });
});
