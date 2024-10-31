// 1.先声明组件的映射关系 Vue.component (components: xxx)
// 2.需要根据组件的名字生成一个组件的虚拟节点
// 3.需要去创造组件的实例
// 4.替换原来渲染内容

const isReservedTag = (tag) => {
  return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
};

// 创建元素vnode 等于render函数里面的 h=>h(App)
export function createElement(vm, tag, data = {}, ...children) {
  // 需要判断tag是元素还是组件
  if (isReservedTag(tag)) {
    return vnode(vm, tag, data, children, data.key, undefined);
  } else {
    // 创造组件的虚拟节点 组件需要找到组件的模版去进行渲染
    const Ctor = vm.$options.components[tag]; // 罪案构造函数
    // Ctor就是组件的定义 可能是一个Sub类 还有可能更是组件的obj选项
    return createComponentVnode(vm, tag, data, children, data.key, Ctor);
  }
}

const init = (vnode) => {
  // 组件的虚拟节点上有组件的实例 new Sub()._init()
  const child = (vnode.componentInstance = new vnode.componentOptions.Ctor({})); // 组件的children {} 放插槽属性
  child.$mount();
};

function createComponentVnode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === 'object' && Ctor !== null) {
    Ctor = vm.$options._base.extend(Ctor); // 组件内部声明的components属性也会包装成类
  }
  data.hook = {
    // 稍后创造真实节点的时候 如果是组件则调用此init方法
    init,
  };
  return vnode(vm, tag, data, undefined, key, undefined, { Ctor, children });
}

/**
 * 先将模板变成了ast语法树 => 生成了render函数 => 创造虚拟节点(虚拟节点可能是元素也可能是组件),
 * 如果是组件就创造组件的虚拟节点(data.hook componentOptions里面放着组件的Ctor) =>
 * 创造真实节点 createElm => 组件会调用init(创造组件的实例并挂载)
 */

// 创建文本vnode
export function createTextNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, data, children, key, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    children,
    key,
    text,
    componentOptions, // 组件的构造函数
    // ...
  };
}
