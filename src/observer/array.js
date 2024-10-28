// 获取数组原型
let oldArrayPrototype = Array.prototype;
// arrayPrototype.__proto__ = Array.prototype
let arrayPrototype = Object.create(oldArrayPrototype);
// 数组变异方法
let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
methods.forEach((method) => {
  // 用户调用push方法会先自己重写的方法, 之后调用数组原来的方法
  arrayPrototype[method] = function (...args) {
    // 需要对新增的数据再次进行劫持
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
    const result = oldArrayPrototype[method].call(this, ...args);
    ob.dep.notify(); // 数据变化了, 通知对应的watcher实现更新逻辑
    return result;
  };
});

export default arrayPrototype;
