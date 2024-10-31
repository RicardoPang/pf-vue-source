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
        if (parent) {
          // Check if parent exists
          parent.children.push({
            type: 3,
            text: text
          });
        }
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

  function initGlobalAPI(Vue) {
    Vue.options = {};
    Vue.options._base = Vue;
    Vue.mixin = function (options) {
      this.options = mergeOptions(this.options, options);
      return this;
    };

    // 组件核心方法 可以手动创造组件进行挂载
    Vue.extend = function (options) {
      // 就是实现根据用户的参数 返回一个构造而已
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // 最终使用一个组件 就是new一个实例
        this._init(options); // 就是默认对子类进行初始化操作
      }
      // 子类继承父类原型方法
      Sub.prototype = Object.create(Vue.prototype); // Sub.prototype.__proto__ === Vue.prototype
      Sub.prototype.constructor = Sub;

      // 希望将用户传递的参数 和全局的Vue.options来合并
      Sub.options = mergeOptions(Vue.options, options); // 保存用户传递的选项
      return Sub;
    };
    Vue.options.components = {}; // 放的是全局组件 全局的指令 Vue.otpions.directives
    Vue.component = function (id, definition) {
      // 如果definition已经是一个函数了 说明用户自己调用了Vue.extend
      definition = typeof definition === 'function' ? definition : Vue.extend(definition);
      Vue.options.components[id] = definition;
    };
  }
  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        // 如果儿子有 父亲有 让父亲和儿子拼在一起
        if (p) {
          return p.concat(c); // 最终八生命周期都合并在一起了
        } else {
          return [c]; // 儿子有父亲没有 则将儿子包装秤数组
        }
      } else {
        return p; // 如果儿子没有则用父亲即可
      }
    };
  });
  strats.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);
    if (childVal) {
      for (var key in childVal) {
        res[key] = childVal[key]; // 返回的是构造的对象 可以拿到父亲原型上的属性 并且将儿子的拷贝到自己身上
      }
    }
    return res;
  };
  function mergeOptions(parent, child) {
    var options = {};
    for (var key in parent) {
      // 循环老的
      mergeField(key);
    }
    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }
    function mergeField(key) {
      // 策略模式 减少if-else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 如果不在测量中则以儿子为主
        options[key] = child[key] || parent[key]; // 优先采用儿子 再采用父亲
      }
    }
    return options;
  }

  // Vue.extend 给我一个对象 我会根据这个对象生成一个类 后续使用组件的时候其实就是new这个类
  // 这个子类会继承父类Vue

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; // 属性的dep要收集watcher
      this.subs = []; // 这里存放着当前属性对应的watcher有哪些
    }
    return _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里我们不希望放重复的watcher，而且刚才只是一个单向的关系 dep -> watcher
        // watcher 记录dep
        // this.subs.push(Dep.target);

        Dep.target.addDep(this); // 让watcher记住dep

        // dep 和 watcher是一个多对多的关系 （一个属性可以在多个组件中使用 dep -> 多个watcher）
        // 一个组件中由多个属性组成 （一个watcher 对应多个dep）
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        }); // 告诉watcher要更新了
      }
    }]);
  }();
  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0;

  // 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
  // 2) 调用_render() 会取值 走到get上
  // 每个属性有一个dep（属性就是被观察者）,watcher就是观察者（属性变化了会通知观察者来更新）-> 观察者模式
  var Watcher = /*#__PURE__*/function () {
    // 不同组件有不同的watcher 目前只有一个 渲染根实例的
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; // 是一个渲染watcher
      this.deps = []; // 后续我们实现计算属性，和一些清理工作需要用到
      this.depsId = new Set();
      this.cb = cb;
      this.vm = vm;
      this.lazy = options.lazy; // lazy属性是用来标识默认是否调用函数
      this.dirty = this.lazy; // dirty属性是用来作缓存的
      this.user = options.user; // 标识是否是用户自己的watcher

      // 如果给的是一个字符串 需要去通过字符串取值
      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          var path = exprOrFn.split('.'); // [a.b]
          return path.reduce(function (vm, current) {
            vm = vm[current];
            return vm;
          }, vm);
        };
      } else {
        this.getter = exprOrFn; // getter意味着调用这个函数可以发生取值操作
      }
      this.value = this.lazy ? undefined : this.get(); // 实现页面渲染
    }
    return _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应着多个属性 重复的属性也不用记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住了dep了而且去重了，此时让dep也记住watcher
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); // 获取到用户函数的返回值 并且还要标识为脏
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); // 静态属性就是只有一份
        var value = this.getter.call(this.vm); // 会去vm上取值 vm._update(vm._render) 取name 和age
        popTarget(); // 渲染完毕后就清空
        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        // watcher的depend 就是让watcher中dep去depend
        var i = this.deps.length;
        while (i--) {
          // 让dep记住渲染watcher
          this.deps[i].depend(); // 让计算属性watcher 也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 如果是计算属性 依赖的值变化了 就标识计算属性是脏值了
          this.dirty = true;
        } else {
          queueWatcher(this); // 把当前的watcher 暂存起来
          // this.get(); // 重新渲染
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get(); // 渲染的时候用的是最新的vm来渲染的
        if (this.user && this.cb) {
          // 如果是用户watcher 则调用用户传入的callback
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);
  }();
  var queue = [];
  var has = {};
  var pending = false; // 防抖
  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    }); // 在刷新的过程中可能还有新的watcher，重新放到queue中
  }
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      // 不管我们的update执行多少次 ，但是最终只执行一轮刷新操作
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    // 默认第一次会将两次的nextTick 都维护到callbacks中 [用户的, 页面渲染的]
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); // 按照顺序依次执行
  }
  // nextTick 没有直接使用某个api 而是采用优雅降级的方式
  // 内部先采用的是promise（ie不兼容）MutationObserver(h5的api) 可以考虑ie专享的 setImmediate setTimeout
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks); // 这里传入的回调是异步执行的
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }
  // 异步任务分为两种,宏任务/微任务
  // 宏任务 setTimeout setImmediate(IE下支持性能优于setTimeout)
  // 微任务 promise.then mutationObserver
  // Vue在更新的时候希望尽快的更新页面 Promise.then MutationObserver setImmediate setImmediate
  // Vue3不再考虑兼容性问题了, 所以后续Vue3中直接使用Promise.then
  function nextTick(cb) {
    // 先内部还是先用户的？
    callbacks.push(cb); // 维护nextTick中的cakllback方法
    if (!waiting) {
      timerFunc();
      // Promise.resolve().then(flushCallbacks);
      waiting = true;
    }
  }

  // 1.先声明组件的映射关系 Vue.component (components: xxx)
  // 2.需要根据组件的名字生成一个组件的虚拟节点
  // 3.需要去创造组件的实例
  // 4.替换原来渲染内容

  var isReservedTag = function isReservedTag(tag) {
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
  };

  // 创建元素vnode 等于render函数里面的 h=>h(App)
  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    // 需要判断tag是元素还是组件
    if (isReservedTag(tag)) {
      return vnode(vm, tag, data, children, data.key, undefined);
    } else {
      // 创造组件的虚拟节点 组件需要找到组件的模版去进行渲染
      var Ctor = vm.$options.components[tag]; // 罪案构造函数
      // Ctor就是组件的定义 可能是一个Sub类 还有可能更是组件的obj选项
      return createComponentVnode(vm, tag, data, children, data.key, Ctor);
    }
  }
  var init = function init(vnode) {
    // 组件的虚拟节点上有组件的实例 new Sub()._init()
    var child = vnode.componentInstance = new vnode.componentOptions.Ctor({}); // 组件的children {} 放插槽属性
    child.$mount();
  };
  function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if (_typeof(Ctor) === 'object' && Ctor !== null) {
      Ctor = vm.$options._base.extend(Ctor); // 组件内部声明的components属性也会包装成类
    }
    data.hook = {
      // 稍后创造真实节点的时候 如果是组件则调用此init方法
      init: init
    };
    return vnode(vm, tag, data, undefined, key, undefined, {
      Ctor: Ctor,
      children: children
    });
  }

  /**
   * 先将模板变成了ast语法树 => 生成了render函数 => 创造虚拟节点(虚拟节点可能是元素也可能是组件),
   * 如果是组件就创造组件的虚拟节点(data.hook componentOptions里面放着组件的Ctor) =>
   * 创造真实节点 createElm => 组件会调用init(创造组件的实例并挂载)
   */

  // 创建文本vnode
  function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function vnode(vm, tag, data, children, key, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      children: children,
      key: key,
      text: text,
      componentOptions: componentOptions // 组件的构造函数
      // ...
    };
  }

  function isSameVnode(n1, n2) {
    // 如果两个人的标签和key 一样我认为是同一个节点 虚拟节点一样我就可以复用真实节点了
    return n1.tag === n2.tag && n1.key === n2.key;
  }

  // 调用组件初始化方法
  function createComponent(vnode) {
    var i = vnode.data;
    if ((i = i.hook) && (i = i.init)) {
      i(vnode); // 初始化组件 找到init方法
    }
    if (vnode.componentInstance) {
      return true; // 说明是组件
    }
  }
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      // 元素
      if (createComponent(vnode)) {
        return vnode.componentInstance.$el;
      }
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child)); // 递归渲染
      });
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // 老的属性中有 新的没有 要删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};
    for (var key in oldStyles) {
      // 老的样式有 新的没有则删除
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }
    for (var _key in oldProps) {
      // 老的属性有 新的没有删除属性
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }
    for (var _key2 in props) {
      // 用新的覆盖老的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }
  function patchVnode(oldVnode, vnode) {
    // case1: 前后两个虚拟节点不是相同节点 直接替换掉即可
    if (!isSameVnode(oldVnode, vnode)) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }
    // 标签一样就复用节点
    var el = vnode.el = oldVnode.el;
    // case2: 两个元素虚拟节点都是文本的情况下 用新文本替换到老文本
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        return el.textContent = vnode.text;
      }
    }
    // case3: 两个都是标签 比对标签属性
    patchProps(el, oldVnode.data, vnode.data);
    // case4: 比较儿子节点 一方有儿子 一方没儿子 两方都有儿子
    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || [];
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整diff算法 比对两个儿子 一层层比较, 不涉及夸级比较
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      // 没有老的 有新的
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      // 新的没有 老的有 直接删除
      el.innerHTML = ''; // 可以循环删除
    }
    return el;
  }

  // Vue2.0中采用双指针的方式比较两个节点
  // 操作列表经常会有push shift pop unshift reverse sort这些方法(针对镇邪情况做一些优化)
  function updateChildren(el, oldChildren, newChildren) {
    // Vue中创建了4个指针 分别指向老孩子和新孩子的头尾
    // 分别一次进行比较有一方先比较完毕就结束
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];
    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }
    var map = makeIndexByKey(oldChildren);

    // 有任何一个不满足则停止 || 有一个为true就继续走
    // 双方有一方的头指针 大于尾部指针则停止循环
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 说明两个是同一个元素 要比较属性和它的儿子
        patchVnode(oldStartVnode, newStartVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
        // 比较开头节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 说明两个是同一个元素 要比较属性和它的儿子
        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
        // 比较结尾节点
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode);
        // insertBefore具备移动性 会将原来的元素移动走
        el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾巴移动到老的前面去
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
        // 比较尾头节点
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode);
        // insertBefore具备移动性 会将原来的元素移动走
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 将老的尾巴移动到老的后面去
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
        // 比较头尾节点
      } else {
        // 根据老的列表做一个映射关系 用新的去找 找到则移动 找不到则添加 最后多余的删除
        // 给动态列表添加key的时候 要尽量避免使用索引 因为索引前后都是从0开始 可能会发生错误复用
        var moveIndex = map[newStartVnode.key]; // 如果拿到则说明是要移动的索引
        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点 复用
          el.insertBefore(moveVnode.el, oldStartVnode.el);
          oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了
          patchVnode(moveVnode, newStartVnode); // 比对属性和子节点
        } else {
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }
        newStartVnode = newChildren[++newStartIndex];
        // 乱序比对
      }
    }
    if (newStartIndex <= newEndIndex) {
      // 新的多了 多余的就插入进去
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);
        // 这里可能向后追加 还可能是向前追加
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // 获取下一个元素
        el.insertBefore(childEl, anchor); // anchor为null的时候则会认为是appendChild
      }
    }
    if (oldStartIndex <= oldEndIndex) {
      // 老的多了 需要删除老的
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }
  }
  function patch(oldVnode, vnode) {
    if (!oldVnode) {
      // 这就是组件的挂载
      return createElm(vnode); // vm.$el 对应的就是组件渲染的结果了
    }

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
    } else {
      // 1.两个节点不是同一个节点 直接删除老的换上新的(没有比对)
      // 2.两个节点是同一个节点(判断节点的tag和节点的key) 比较两个节点的属性是否有差异(复用老节点 将差异的属性更新)
      // 3.节点比较完毕后就需要比较两个的儿子了
      patchVnode(oldVnode, vnode);
      return vnode.el; // 最终返回新的el元素
    }
  }

  // 1.每次更新页面的话，dom结构不会变，调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom
  // 2.Vue3采用了最长递增子序列 找到最长不需要移动的序列 从而减少了移动操作

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];
    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm);
      }
    }
  }

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
      var prevVnode = vm._vnode; // 上一次的vNode
      if (!prevVnode) {
        vm.$el = patch(vm.$el, vnode); // 可以初始化渲染，后续更新也走这个patch方法
      } else {
        vm.$el = patch(prevVnode, vnode);
      }
      vm._vnode = vnode; // 渲染完毕后重新更新vnode
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
    new Watcher(vm, updateComponent, function () {
      console.log('页面传喔国内新渲染 updated');
    }, true);
    // updateComponent(); // 如果稍后数据变化，也调用这个函数重新执行
    // 观察者模式 + 依赖收集 + diff算法
  }

  // 获取数组原型
  var oldArrayPrototype = Array.prototype;
  // arrayPrototype.__proto__ = Array.prototype
  var arrayPrototype = Object.create(oldArrayPrototype);
  // 数组变异方法
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (method) {
    // 用户调用push方法会先自己重写的方法, 之后调用数组原来的方法
    arrayPrototype[method] = function () {
      var _oldArrayPrototype$me;
      // 需要对新增的数据再次进行劫持
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
      var result = (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));
      ob.dep.notify(); // 数据变化了, 通知对应的watcher实现更新逻辑
      return result;
    };
  });

  // 1.给每个对象和数组也增加dep属性
  // 2.当页面取值的时候会执行get方法, 拿到刚才新增的dep属性, 让它记住这个watcher
  // 3.稍后数据变化, 触发当前数组的dep中存放的watcher去更新
  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      this.dep = new Dep(); // 给所有的对象都增加一个dep,后续会给对象增添新的属性也希望能实现更新
      // 如果有__ob__属性, 说明被观测过了
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false,
        // 不可枚举(循环的时候无法获取到)
        writable: true,
        configurable: true
      });
      if (Array.isArray(data)) {
        // 如果是数组的话也是用defineProperty会浪费很多性能, 并且很少用户会通过索引操作 arr[666] = 777
        // vue3中的Polyfill直接就给数组做代理了
        // 改写数组的方法, 用户调用了可以改写数组方法的api, 那么就去劫持这个方法
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
  }(); // 深层次嵌套会递归, 递归多了性能差, 不粗案子属性监控不到, 存在的属性要重写方法
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  // 性能不好的原因, 所有的属性都被重新定义了一遍
  // 一上来需要将对象深度代理, 性能差
  // 闭包 属性劫持
  function defineReactive(data, key, value) {
    var childOb = observe(value); // 递归代理属性, childOb就是当前的实例
    // 属性会全部被重写添加了get和set
    var dep = new Dep(); // 每一个属性都有一个dep
    Object.defineProperty(data, key, {
      // 取值的时候 会执行get
      get: function get() {
        if (Dep.target) {
          dep.depend(); // 让这个属性的收集器记住当前的watcher
          if (childOb) {
            childOb.dep.depend(); // 让数组和对象本身也实现依赖收集
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      // 修改的时候 会执行set
      set: function set(newValue) {
        // 修改的时候 会执行set
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
        dep.notify(); // 通知更新
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== 'object' || data == null) {
      // 如果不是对象类型, 那么不需要做任何处理
      return;
    }
    if (data.__ob__ instanceof Observer) {
      // 说明这个属性已经被代理过了
      return data.__ob__;
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

    // 后续实现计算属性 这里初始化的顺序依次是 prop>methods>data>computed>watch
    if (options.data) {
      // 初始化data
      initData(vm);
    }
    if (options.computed) {
      initComputed(vm);
    }
    if (options.watch) {
      initWatch(vm);
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
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key]; // 字符串 数组 函数
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatch(vm, key, handler[i]);
        }
      } else {
        // 对当前属性进行创建watcher 存放的回调是handler 取数据是从vm上获取
        createWatch(vm, key, handler);
      }
    }
  }
  function createWatch(vm, key, handler) {
    // 判断如果handler是一个字符串 可以采用实例上的方法
    var options;
    if (_typeof(handler) === 'object' && handler !== null) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(key, handler, options);
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; // 将计算属性watcher保存到vm上
    for (var key in computed) {
      var userDef = computed[key];
      // 监控计算属性中get的变化
      var fn = typeof userDef === 'function' ? userDef : userDef.get;
      // 如果直接new Watcher 默认就会执行fn 将属性和watcher对应起来
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    var setter = userDef.set || function () {};
    // 每次取值都会执行 可以通过实例拿到对应的属性
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  // 计算属性根本不会收集依赖 只会让自己的依赖属性去收集依赖
  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key]; // 获取到对应属性的watcher
      if (watcher.dirty) {
        // 如果是脏的就去执行 用户传入的函数
        watcher.evaluate(); // 求值后 dirty变为了false 下次就不求值了
      }
      // 在求值的过程中 stack = [渲染watcher, 计算属性watcher]
      // 在evaluate执行完毕后 stack = [渲染watcher] => Dep.target = 渲染watcher
      if (Dep.target) {
        // 让计算属性watcher对应的两个dep记录watcher即可
        // 计算属性出栈后 还要渲染watcher 应该让计算属性watcher里面的属性 也去收集上一层watcher
        watcher.depend();
      }
      return watcher.value; // 最后返回的是watcher上的值
    };
  }
  function stateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exprOrFn, cb) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.user = true; // 标记为用户watcher
      var watcher = new Watcher(this, exprOrFn, options, cb);
      if (options.immediate) {
        cb.call(this, watcher.value);
      }
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // vue中会判断如果是$开头的属性不会被变成响应式数据
      this.$options = mergeOptions(vm.constructor.options, options); // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
      console.log(this.$options);

      // 对于实例的数据源 props data methods computed watch
      // prop data
      callHook(vm, 'beforeCreate');
      initState(vm);
      callHook(vm, 'created');

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
  stateMixin(Vue);
  initGlobalAPI(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
