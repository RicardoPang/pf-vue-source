// 整个自己编写的Vue入口

import { compileToFunctions } from './compiler/index';
import { initMixin } from './init';
import { lifeCycleMixin } from './lifecycle';
import { nextTick } from './observer/watcher';
import { createElm, patch } from './vdom/patch';

// es6的类, 要求所有的扩展都在类的内部来进行扩展

function Vue(options) {
  this._init(options);
}

initMixin(Vue); // 后续再扩展都可以采用这种方式
lifeCycleMixin(Vue);

Vue.prototype.$nextTick = nextTick;

// ------------- 为了方便观察前后的虚拟节点-- 测试的-----------------
let vm0 = new Vue({
  data: {
    name: 'pf',
    age: 22,
  },
});
let render0 = compileToFunctions(
  `<div class="a" style="color: lightblue;" b="1"><span>{{name}}</span><span>{{age}}</span></div>`
);
let oldVnode = render0.call(vm0);
let ele = createElm(oldVnode);
document.body.appendChild(ele);

let vm = new Vue({
  data: {
    message: 'hello world',
  },
});
let render = compileToFunctions(
  `<div class="b" style="color: red" c=33><span>{{message}}</span></div>`
);
let newVnode = render.call(vm);

let render1 = compileToFunctions(`<ul  a="1" style="color:blue">
    <li key="A">a</li>
    <li key="B">b</li>
    <li key="C">c</li>
    <li key="D">d</li>
</ul>`);
let vm1 = new Vue({ data: { name: 'pf' } });
let prevVnode = render1.call(vm1);
let el = createElm(prevVnode);
document.body.appendChild(el);

let render2 = compileToFunctions(`<ul  a="1"  style="color:red;">
    <li key="C">c</li>
    <li key="A">a</li>
    <li key="D">d</li>
    <li key="E">e</li>
    <li key="Q">q</li>
</ul>`);
let vm2 = new Vue({ data: { name: 'zf' } });
let nextVnode = render2.call(vm2);

// 直接将新的节点替换掉了老的，不是直接替换 而是比较两个人的区别之后在替换 diff算法
// diff算法是一个平级比较的过程 父亲和父亲比对，儿子和儿子比对
// 主要比对标签名和key来判断是不是同一个元素, 如果标签和key都一样说明两个元素使同一个元素
setTimeout(() => {
  // patch(oldVnode, newVnode);

  patch(prevVnode, nextVnode);
}, 2000);

// 给Vue添加原型方法我们通过文件的方式来添加, 防止所有的功能都在一个文件中来处理
export default Vue;
