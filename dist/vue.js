(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // 整个自己编写的Vue入口

  var index = {
    a: 1,
    b: 2
  };

  return index;

}));
//# sourceMappingURL=vue.js.map
