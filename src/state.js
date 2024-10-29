import Dep from './observer/dep';
import { observe } from './observer/index';
import Watcher, { nextTick } from './observer/watcher';

export function initState(vm) {
  // 获取传入的数据对象
  const options = vm.$options;

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
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  // 如果是函数就拿到函数的返回值, 否则就直接采用data作为数据源
  data = vm._data = typeof data === 'function' ? data.call(vm) : data;
  // 期望用户可以直接通过 vm.xxx 获取值, 也可以这样取值 vm._data.xxx
  for (let key in data) {
    proxy(vm, '_data', key);
  }
  // 属性劫持, 采用defineProperty将所有的属性进行劫持
  observe(data);
}

function initWatch(vm) {
  const watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // 字符串 数组 函数
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
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
  let options;
  if (typeof handler === 'object' && handler !== null) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(key, handler, options);
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {}); // 将计算属性watcher保存到vm上
  for (let key in computed) {
    let userDef = computed[key];
    // 监控计算属性中get的变化
    const fn = typeof userDef === 'function' ? userDef : userDef.get;
    // 如果直接new Watcher 默认就会执行fn 将属性和watcher对应起来
    watchers[key] = new Watcher(vm, fn, { lazy: true });
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => {});
  // 每次取值都会执行 可以通过实例拿到对应的属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

// 计算属性根本不会收集依赖 只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key]; // 获取到对应属性的watcher
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

export function stateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;
  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    options.user = true; // 标记为用户watcher
    const watcher = new Watcher(this, exprOrFn, options, cb);
    if (options.immediate) {
      cb.call(this, watcher.value);
    }
  };
}
