import arrayPrototype from './array';

class Observer {
  constructor(data) {
    // 如果有__ob__属性, 说明被观测过了
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false, // 不可枚举
      writable: true,
      configurable: true,
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
  observeArray(data) {
    data.forEach((item) => observe(item)); // 如果是对象才观测
  }
  walk(data) {
    // 循环对象, 尽量不用for in 会遍历原型链
    let keys = Object.keys(data);
    keys.forEach((key) => {
      // 没有重写数组里的每一项
      defineReactive(data, key, data[key]);
    });
  }
}

// 性能不好的原因, 所有的属性都被重新定义了一遍
// 一上来需要将对象深度代理, 性能差
function defineReactive(data, key, value) {
  observe(value); // 递归代理属性
  // 属性会全部被重写添加了get和set
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newValue) {
      observe(newValue); // 赋值一个对象, 也可以实现响应式数据
      if (newValue !== value) {
        value = newValue;
      }
    },
  });
}

export function observe(data) {
  if (typeof data !== 'object' || data == null) {
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
