import Watcher from './observer/watcher';
import { createElement, createTextNode } from './vdom/index';
import { patch } from './vdom/patch';

// 创建对应的虚拟节点，进行渲染
export function lifeCycleMixin(Vue) {
  Vue.prototype._c = function () {
    return createElement(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value === 'object' && value != null) {
      return JSON.stringify(value); // 将数据转换成字符串，因为使用的变量对应的结果可能是一个对象
    }
    return value;
  };
  Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render;
    const vnode = render.call(vm);
    return vnode;
  };
  Vue.prototype._update = function (vnode) {
    // 将虚拟节点变成真实节点
    // 将vnode渲染到el元素中
    const vm = this;
    const prevVnode = vm._vnode; // 上一次的vNode
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
export function mountComponent(vm, el) {
  // 实现页面的挂载流程
  vm.$el = el; // 先将el挂载到实例上
  const updateComponent = () => {
    // 需要调用生成的render函数，获取到虚拟节点，生成真实节点
    vm._update(vm._render());
  };
  new Watcher(
    vm,
    updateComponent,
    () => {
      console.log('页面传喔国内新渲染 updated');
    },
    true
  );
  // updateComponent(); // 如果稍后数据变化，也调用这个函数重新执行
  // 观察者模式 + 依赖收集 + diff算法
}
