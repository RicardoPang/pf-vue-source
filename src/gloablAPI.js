export default function initGlobalAPI(Vue) {
  Vue.options = {};
  Vue.options._base = Vue;
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options);
    return this;
  };

  // 组件核心方法 可以手动创造组件进行挂载
  Vue.extend = function (options) {
    // 就是实现根据用户的参数 返回一个构造而已
    function Sub(options = {}) {
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
    definition =
      typeof definition === 'function' ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  };
}

const strats = {};
const LIFECYCLE = ['beforeCreate', 'created'];

LIFECYCLE.forEach((hook) => {
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
  const res = Object.create(parentVal);
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key]; // 返回的是构造的对象 可以拿到父亲原型上的属性 并且将儿子的拷贝到自己身上
    }
  }
  return res;
};

export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    // 循环老的
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
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
