import { observe } from './observer/index';

export function initState(vm) {
  // 获取传入的数据对象
  const options = vm.$options;

  // 后续实现计算属性 watch props methods
  if (options.data) {
    // 初始化data
    initData(vm);
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
