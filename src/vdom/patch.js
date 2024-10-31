function isSameVnode(n1, n2) {
  // 如果两个人的标签和key 一样我认为是同一个节点 虚拟节点一样我就可以复用真实节点了
  return n1.tag === n2.tag && n1.key === n2.key;
}

// 调用组件初始化方法
function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode); // 初始化组件 找到init方法
  }
  if (vnode.componentInstance) {
    return true; // 说明是组件
  }
}

export function createElm(vnode) {
  const { tag, data, children, text } = vnode;
  if (typeof tag === 'string') {
    // 元素
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child)); // 递归渲染
    });
  } else {
    // 文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, oldProps = {}, props = {}) {
  // 老的属性中有 新的没有 要删除老的
  const oldStyles = oldProps.style || {};
  const newStyles = props.style || {};
  for (let key in oldStyles) {
    // 老的样式有 新的没有则删除
    if (!newStyles[key]) {
      el.style[key] = '';
    }
  }
  for (let key in oldProps) {
    // 老的属性有 新的没有删除属性
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }
  for (let key in props) {
    // 用新的覆盖老的
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i];
    el.appendChild(createElm(child));
  }
}

function patchVnode(oldVnode, vnode) {
  // case1: 前后两个虚拟节点不是相同节点 直接替换掉即可
  if (!isSameVnode(oldVnode, vnode)) {
    return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
  }
  // 标签一样就复用节点
  let el = (vnode.el = oldVnode.el);
  // case2: 两个元素虚拟节点都是文本的情况下 用新文本替换到老文本
  if (!oldVnode.tag) {
    if (oldVnode.text !== vnode.text) {
      return (el.textContent = vnode.text);
    }
  }
  // case3: 两个都是标签 比对标签属性
  patchProps(el, oldVnode.data, vnode.data);
  // case4: 比较儿子节点 一方有儿子 一方没儿子 两方都有儿子
  const oldChildren = oldVnode.children || [];
  const newChildren = vnode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整diff算法 比对两个儿子 一层层比较, 不涉及夸级比较
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    // 没有老的 有新的
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    // 新的没有 老的有 直接删除
    el.innerHTML = ''; // 可以循环删除
  }
  return el;
}

// Vue2.0中采用双指针的方式比较两个节点
// 操作列表经常会有push shift pop unshift reverse sort这些方法(针对镇邪情况做一些优化)
function updateChildren(el, oldChildren, newChildren) {
  // Vue中创建了4个指针 分别指向老孩子和新孩子的头尾
  // 分别一次进行比较有一方先比较完毕就结束
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    const map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }
  const map = makeIndexByKey(oldChildren);

  // 有任何一个不满足则停止 || 有一个为true就继续走
  // 双方有一方的头指针 大于尾部指针则停止循环
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 说明两个是同一个元素 要比较属性和它的儿子
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
      // 比较开头节点
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 说明两个是同一个元素 要比较属性和它的儿子
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
      // 比较结尾节点
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      // insertBefore具备移动性 会将原来的元素移动走
      el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾巴移动到老的前面去
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
      // 比较尾头节点
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      // insertBefore具备移动性 会将原来的元素移动走
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 将老的尾巴移动到老的后面去
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
      // 比较头尾节点
    } else {
      // 根据老的列表做一个映射关系 用新的去找 找到则移动 找不到则添加 最后多余的删除
      // 给动态列表添加key的时候 要尽量避免使用索引 因为索引前后都是从0开始 可能会发生错误复用
      const moveIndex = map[newStartVnode.key]; // 如果拿到则说明是要移动的索引
      if (moveIndex !== undefined) {
        const moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点 复用
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了
        patchVnode(moveVnode, newStartVnode); // 比对属性和子节点
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
      // 乱序比对
    }
  }
  if (newStartIndex <= newEndIndex) {
    // 新的多了 多余的就插入进去
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const childEl = createElm(newChildren[i]);
      // 这里可能向后追加 还可能是向前追加
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null; // 获取下一个元素
      el.insertBefore(childEl, anchor); // anchor为null的时候则会认为是appendChild
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    // 老的多了 需要删除老的
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        const childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}

export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    // 这就是组件的挂载
    return createElm(vnode); // vm.$el 对应的就是组件渲染的结果了
  }

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
    // 1.两个节点不是同一个节点 直接删除老的换上新的(没有比对)
    // 2.两个节点是同一个节点(判断节点的tag和节点的key) 比较两个节点的属性是否有差异(复用老节点 将差异的属性更新)
    // 3.节点比较完毕后就需要比较两个的儿子了
    patchVnode(oldVnode, vnode);
    return vnode.el; // 最终返回新的el元素
  }
}

// 1.每次更新页面的话，dom结构不会变，调用render方法时，数据变化了会根据数据渲染成新的虚拟节点，用新的虚拟节点渲染dom
// 2.Vue3采用了最长递增子序列 找到最长不需要移动的序列 从而减少了移动操作
