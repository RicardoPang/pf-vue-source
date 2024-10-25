(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (String )(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  var oldArrayPrototype = Array.prototype;
  // arrayPrototype.__proto__ = Array.prototype

  var arrayPrototype = Object.create(oldArrayPrototype);
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    // 用户调用push方法会先自己重写的方法, 之后调用数组原来的方法
    arrayPrototype[method] = function () {
      var _oldArrayPrototype$me;
      var inserted;
      var ob = this.__ob__;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; // 数组
          break;
        case 'splice':
          // arr.splice(1, 1, xxx)
          inserted = args.slice(2);
          break;
      }
      if (inserted) {
        // 对新增的数据再次进行观测
        ob.observeArray(inserted);
      }
      return (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));
    };
  });

  // 总结:
  // 1.在Vue2中对象响应式原理, 就是给每个属性增加get和set, 而且递归操作(用户在写代码的时候尽量不要把所有属性都放在data中, 层次尽可能不要太深), 赋值一个新对象也会被变成响应式
  // 2.数组没有使用defineProperty, 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法, 用户在调用的时候采用的是这7个方法, 增加了逻辑如果是新增的数据会再次被劫持, 最终调用数组的原有方法(注意数字的索引和长度没有被监控), 数组中对象类型会被进行响应式处理

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 如果有__ob__属性, 说明被观测过了
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false,
        // 不可枚举
        writable: true,
        configurable: true
      });
      if (Array.isArray(data)) {
        // 如果是数组的话也是用defineProperty回浪费很多性能, 并且很少用户会通过索引操作 arr[666] = 777
        // vue3中的Polyfill直接就给数组做代理了
        // 改写数组的方法, 勇敢用户调用了可以改写数组方法的api, 那么就去劫持这个方法
        // 变异方法 push pop shift unshift reverse sort splice
        // 修改数组的索引和长度无法更新视图
        data.__proto__ = arrayPrototype;
        // 如果数组里面放的是对象类型, 期望它也会被变成响应式的
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    return _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        }); // 如果是对象才观测
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 循环对象, 尽量不用for in 会遍历原型链
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          // 没有重写数组里的每一项
          defineReactive(data, key, data[key]);
        });
      }
    }]);
  }(); // 性能不好的原因, 所有的属性都被重新定义了一遍
  // 一上来需要将对象深度代理, 性能差
  function defineReactive(data, key, value) {
    observe(value); // 递归代理属性
    // 属性会全部被重写添加了get和set
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        observe(newValue); // 赋值一个对象, 也可以实现响应式数据
        if (newValue !== value) {
          value = newValue;
        }
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== 'object' || data == null) {
      // 如果不是对象类型, 那么不需要做任何处理
      return;
    }
    if (data.__ob__) {
      // 说明这个属性已经被代理过了
      return;
    }
    // 如果一个对象已经被观测了, 就不要再次被观测了
    // __ob__ 标识是否又被观测过
    return new Observer(data);
  }

  // 总结:
  // 1.在Vue2中对象响应式原理, 就是给每个属性增加get和set, 而且递归操作(用户在写代码的时候尽量不要把所有属性都放在data中, 层次尽可能不要太深), 赋值一个新对象也会被变成响应式
  // 2.数组没有使用defineProperty, 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法, 用户在调用的时候采用的是这7个方法, 增加了逻辑如果是新增的数据会再次被劫持, 最终调用数组的原有方法(注意数字的索引和长度没有被监控), 数组中对象类型会被进行响应式处理

  // 补充:
  // 1.每个类头有一个prototype指向了一个公共的空间
  // 2.每个实例可以通过__proto__找到所属类的prototype对应的内容

  function initState(vm) {
    // 获取传入的数据对象
    var options = vm.$options;

    // 后续实现计算属性 watch props methods
    if (options.data) {
      // 初始化data
      initData(vm);
    }
  }
  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    // 如果是函数就拿到函数的返回值, 否则就直接采用data作为数据源
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    // 期望用户可以直接通过 vm.xxx 获取值, 也可以这样取值 vm._data.xxx
    for (var key in data) {
      proxy(vm, '_data', key);
    }
    // 属性劫持, 采用defineProperty将所有的属性进行劫持
    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // vue中会判断如果是$开头的属性不会被变成响应式数据
      this.$options = options; // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项

      // 对于实例的数据源 props data methods computed watch
      // prop data
      initState(vm);
    };
  }

  // 整个自己编写的Vue入口


  // es6的类, 要求所有的扩展都在类的内部来进行扩展

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue); // 后续再扩展都可以采用这种方式

  return Vue;

}));
//# sourceMappingURL=vue.js.map
