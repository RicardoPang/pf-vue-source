let oldArrayPrototype = Array.prototype;
// arrayPrototype.__proto__ = Array.prototype

let arrayPrototype = Object.create(oldArrayPrototype);
let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
methods.forEach((method) => {
  // 用户调用push方法会先自己重写的方法, 之后调用数组原来的方法
  arrayPrototype[method] = function (...args) {
    let inserted;
    const ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args; // 数组
        break;
      case 'splice': // arr.splice(1, 1, xxx)
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    if (inserted) {
      // 对新增的数据再次进行观测
      ob.observeArray(inserted);
    }
    return oldArrayPrototype[method].call(this, ...args);
  };
});

export default arrayPrototype;

// 总结:
// 1.在Vue2中对象响应式原理, 就是给每个属性增加get和set, 而且递归操作(用户在写代码的时候尽量不要把所有属性都放在data中, 层次尽可能不要太深), 赋值一个新对象也会被变成响应式
// 2.数组没有使用defineProperty, 采用的是函数劫持创造一个新的原型重写了这个原型的7个方法, 用户在调用的时候采用的是这7个方法, 增加了逻辑如果是新增的数据会再次被劫持, 最终调用数组的原有方法(注意数字的索引和长度没有被监控), 数组中对象类型会被进行响应式处理
