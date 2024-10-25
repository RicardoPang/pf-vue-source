(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
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
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
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
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

  // 处理attrs属性
  function genProps(attrs) {
    var str = '';
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      // 特殊属性 style
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').reduce(function (memo, current) {
          var _current$split = current.split(':'),
            _current$split2 = _slicedToArray(_current$split, 2),
            key = _current$split2[0],
            value = _current$split2[1];
          memo[key] = value;
          return memo;
        }, obj);
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function gen(node) {
    if (node.type === 1) {
      return generate(node);
    } else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")"); // 不带表达式
      } else {
        var tokens = [];
        var match;
        // exec 遇到全局匹配会有 lastIndex 问题，每次匹配谦虚要将lastIndex置为0
        var startIndex = defaultTagRE.lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var endIndex = match.index; // 匹配到的索引 abc ｛｛aa｝｝ {{bb}} cd
          if (endIndex > startIndex) {
            tokens.push(JSON.stringify(text.slice(startIndex, endIndex)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          startIndex = endIndex + match[0].length;
        }
        if (startIndex < text.length) {
          // 将最后的尾巴也丢进去
          tokens.push(JSON.stringify(text.slice(startIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")"); // 组合成最终的语法
      }
    }
  }

  // 生成子节点，递归创建
  function genChildren(el) {
    var children = el.children;
    if (children) {
      return "".concat(children.map(function (child) {
        return gen(child);
      }).join(','));
    }
  }
  function generate(el) {
    // 字符串拼接
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")"); // _c('div', {className: 'xxx'}, _v('hello world'))
    return code;
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //匹配标签名 形如 abc-123
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //匹配特殊标签 形如 abc:234 前面的abc:可有可无
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

  function parse(html) {
    var root; // 树的操作，需要根据开始标签和结束标签产生一棵树
    // 如何构建树的父子关系
    var stack = [];
    while (html) {
      // 一个个字符来解析将结果跑出去
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); // 解析开始标签
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var matches = void 0;
        if (matches = html.match(endTag)) {
          // </div> 不是开始就会走到结束
          end(matches[1]);
          advance(matches[0].length);
          continue;
        }
      }
      var text = void 0;
      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }
      if (text) {
        advance(text.length);
        chars(text);
      }
    }
    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1
      };
    }
    function start(tagName, attrs) {
      var element = createASTElement(tagName, attrs);
      if (root == null) {
        root = element;
      }
      var parent = stack[stack.length - 1]; // 取到栈中最后一个
      if (parent) {
        element.parent = parent; // 让这个元素记住自己的父亲是谁
        parent.children.push(element); // 让父亲记住儿子是谁
      }
      // 将原素放到栈中
      stack.push(element);
    }
    function end(tagName) {
      stack.pop();
    }
    function chars(text) {
      text = text.replace(/\s/g, '');
      if (text) {
        var parent = stack[stack.length - 1];
        parent.children.push({
          type: 3,
          text: text
        });
      }
    }
    function parseStartTag() {
      var matches = html.match(startTagOpen);
      if (matches) {
        var match = {
          tagName: matches[1],
          attrs: []
        };
        advance(matches[0].length);
        // 继续解析开始标签的属性
        var _end, attr;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 只要没有匹配到结束标签就一直匹配
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          advance(attr[0].length); // 解析一个属性删除一个
        }
        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }
    function advance(n) {
      html = html.substring(n); // 每次根据传入的长度截取html
    }
    return root;
  }

  // 将模板变成render函数，通过with+new Function的方式让字符串变成js语法来执行
  function compileToFunctions(template) {
    var ast = parse(template);

    // 通过ast语法树转换成render函数
    var code = generate(ast);

    // 使用with改变作用域为this
    var renderFn = new Function("with(this) {return ".concat(code, "}"));
    return renderFn;
  }

  // 将template转换成ast语法树, 再将语法树转换成一个字符串拼接在一起
  // ast用来描述语言本身，语法中没有的，不会被描述出来
  // vdom描述真实dom元素，可以自己添加属性

  // 创建元素vnode 等于render函数里面的 h=>h(App)
  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, data, children, data.key, null);
  }

  // 创建文本vnode
  function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function vnode(vm, tag, data, children, key, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      children: children,
      key: key,
      text: text
      // ...
    };
  }

  function patch(oldVnode, vnode) {
    // oldVnode可能是后续做虚拟节点的时候，是两个虚拟节点的比较
    var isRealElement = oldVnode.nodeType; // 如果有说明是一个dom元素
    if (isRealElement) {
      // 初次渲染
      var oldElm = oldVnode;
      // 需要获取父节点，将当前的节点的下一个节点作为参照物，将它插入，之后删除老节点
      var parentNode = oldElm.parentNode; // 父节点
      var el = createElm(vnode); // 根据虚拟节点转换成真实dom节点
      // 插入到老的el节点下一个节点的前面，就相当于插入到老的el节点的后面
      // 这里不直接使用父元素appendChild是为了不破坏替换的位置
      parentNode.insertBefore(el, oldElm.nextSibling);
      // 删除老的el节点
      parentNode.removeChild(oldElm);
      return el;
    }
  }
  function createElm(vnode) {
    var tag = vnode.tag;
      vnode.data;
      var children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      // 元素
      vnode.el = document.createElement(tag);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child)); // 递归渲染
      });
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }

  // 每次更新页面的话，dom结构不会变，调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom

  // 创建对应的虚拟节点，进行渲染
  function lifeCycleMixin(Vue) {
    Vue.prototype._c = function () {
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) === 'object' && value != null) {
        return JSON.stringify(value); // 将数据转换成字符串，因为使用的变量对应的结果可能是一个对象
      }
      return value;
    };
    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
    Vue.prototype._update = function (vnode) {
      // 将虚拟节点变成真实节点
      // 将vnode渲染到el元素中
      var vm = this;
      vm.$el = patch(vm.$el, vnode); // 可以初始化渲染，后续更新也走这个patch方法
    };
  }

  // 将模板ast => render => render函数产生虚拟节点（数据得是渲染好的）
  //                |________________|
  function mountComponent(vm, el) {
    // 实现页面的挂载流程
    vm.$el = el; // 先将el挂载到实例上
    var updateComponent = function updateComponent() {
      // 需要调用生成的render函数，获取到虚拟节点，生成真实节点
      vm._update(vm._render());
    };
    updateComponent(); // 如果稍后数据变化，也调用这个函数重新执行

    // 观察者模式 + 依赖收集 + diff算法
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

      // 状态初始化完毕后需要进行页面挂载
      if (vm.$options.el) {
        // el属性和直接调用$mount是一样的
        vm.$mount(vm.$options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var options = vm.$options;
      if (!options.render) {
        var template = options.template;
        if (!template && el) {
          template = el.outerHTML;
        }
        // 将template变成render函数
        // 创建render函数 => 虚拟dom => 渲染真实dom
        var render = compileToFunctions(template); // 开始编译
        options.render = render;
      }
      // 将当前组件实例挂载到真实的el节点上面
      return mountComponent(vm, el);
    };
  }

  // diff算法, 主要是两个虚拟节点的比对, 需要根据模板渲染出一个render函数, render函数可以返回一个虚拟节点, 数据更新了重新调用render函数, 可以再返回一个虚拟节点

  // 整个自己编写的Vue入口


  // es6的类, 要求所有的扩展都在类的内部来进行扩展

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue); // 后续再扩展都可以采用这种方式
  lifeCycleMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
