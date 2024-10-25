export function patch(oldVnode, vnode) {
  // oldVnode可能是后续做虚拟节点的时候，是两个虚拟节点的比较
  const isRealElement = oldVnode.nodeType; // 如果有说明是一个dom元素
  if (isRealElement) {
    // 初次渲染
    const oldElm = oldVnode;
    // 需要获取父节点，将当前的节点的下一个节点作为参照物，将它插入，之后删除老节点
    const parentNode = oldElm.parentNode; // 父节点
    const el = createElm(vnode); // 根据虚拟节点转换成真实dom节点
    // 插入到老的el节点下一个节点的前面，就相当于插入到老的el节点的后面
    // 这里不直接使用父元素appendChild是为了不破坏替换的位置
    parentNode.insertBefore(el, oldElm.nextSibling);
    // 删除老的el节点
    parentNode.removeChild(oldElm);
    return el;
  } else {
    // diff 算法
  }
}

function createElm(vnode) {
  const { tag, data, children, text } = vnode;
  if (typeof tag === 'string') {
    // 元素
    vnode.el = document.createElement(tag);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child)); // 递归渲染
    });
  } else {
    // 文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 每次更新页面的话，dom结构不会变，调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom
