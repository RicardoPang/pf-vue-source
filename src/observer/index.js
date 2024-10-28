import arrayPrototype from './array';
import Dep from './dep';

// 1.给每个对象和数组也增加dep属性
// 2.当页面取值的时候会执行get方法, 拿到刚才新增的dep属性, 让它记住这个watcher
// 3.稍后数据变化, 触发当前数组的dep中存放的watcher去更新

class Observer {
  constructor(data) {
    this.dep = new Dep(); // 给所有的对象都增加一个dep,后续会给对象增添新的属性也希望能实现更新
    // 如果有__ob__属性, 说明被观测过了
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false, // 不可枚举(循环的时候无法获取到)
      writable: true,
      configurable: true,
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

// 深层次嵌套会递归, 递归多了性能差, 不粗案子属性监控不到, 存在的属性要重写方法
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i];
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
  const childOb = observe(value); // 递归代理属性, childOb就是当前的实例
  // 属性会全部被重写添加了get和set
  let dep = new Dep(); // 每一个属性都有一个dep
  Object.defineProperty(data, key, {
    // 取值的时候 会执行get
    get() {
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
    set(newValue) {
      // 修改的时候 会执行set
      if (newValue === value) return;
      observe(newValue);
      value = newValue;
      dep.notify(); // 通知更新
    },
  });
}

export function observe(data) {
  if (typeof data !== 'object' || data == null) {
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
