## 1.请说一下`Vue2`响应式数据的理解 （先知道基本的问题在哪， 源码的角度回答， 你用的时候会有哪些问题）

可以监控一个数据的修改和获取操作。 针对对象格式会给每个对象的属性进行劫持 Object.defineProperty

> 源码层面 initData -> observe -> defineReactive 方法 （内部对所有属性进行了重写 性能问题） 递归增加对象中的对象增加 getter 和 setter

> 我们在使用 Vue 的时候如果 层级过深（考虑优化） 如果数据不是响应式的就不要放在 data 中了。 我们属性取值的时候尽量避免多次取值。 如果有些对象是放到 data 中的但是不是响应式的可以考虑采用 Object.freeze() 来冻结对象

```
let total = 0;
for(let i = 0; ; i< 100；i++>){
    total += i;
}
this.timer = total
```

## 2.`Vue`中如何检测数组变化?

vue2 中检测数组的变化并没有采用 defineProperty 因为修改索引的情况不多(如果直接使用 defineProperty 会浪费大量性能)。 采用重写数组的变异方法来实现 （函数劫持）

> initData -> observe -> 对我们传入的数组进行原型链修改，后续调用的方法都是重写后的方法 -》 对数组中每个对象也再次进行代理

修改数组索引 ，修改长度是无法进行监控的 arr[1] = 100; arr.length = 300; 不会触发视图更新的

arr[0].xxx = 100; 因为数组中的对象会被 observe

## 3.`Vue`中如何进行依赖收集？

- 所谓的依赖收集 （观察者模式） 被观察者指代的是数据 (dep)， 观察者（watcher 3 中渲染 wather、计算属性、用户 watcher）
- 一个 watcher 中可能对应着多个数据 watcher 中还需要保存 dep （重新渲染的时候可以让属性重新记录 watcher） 计算属性也会用到

> 多对多的关系 一个 dep 对应多个 watcher ， 一个 watcher 有多个 dep 。 默认渲染的时候会进行依赖收集（会触发 get 方法）， 数据更新了就找到属性对应的 watcher 去触发更新

![](https://p.ipic.vip/1x5wz0.png)

取值的时候收集依赖，设值的时候更新视图

## 4.如何理解`Vue`中模板编译原理

我们用户传递的是 template 属性，我们需要将这个 template 编译成 render 函数

- template -> ast 语法树
- 对语法树进行标记 （标记的是静态节点）
- 将 ast 语法树生成 render 函数

> 最终每次渲染可以调用 render 函数返回对应的虚拟节点 (递归是先子后父)

## 5.`Vue`生命周期钩子是如何实现的

就是内部利用了一个发布订阅模式 将用户写的钩子维护成了一个数组，后续一次调用 callHook。 主要靠的是 mergeOptions

> 内部就是一个发布订阅模式

为什么有些钩子的执行是先子后父亲，有些是先父后子 组件渲染是如何渲染的？

// 遇到父组件就先渲染父组件

<div id="app">
    // 遇到子组件就渲染子组件
    <my-button   >
    // 先渲染子组件后 完成才能渲染完毕父组件
</div>

## 6.`Vue`的生命周期方法有哪些？一般在哪一步发送请求及原因

beforeCreate 这里没有实现响应式数据 vue3 中不需要用了 没用
created √ 拿到的是响应式的属性 (不涉及到 dom 渲染) 这个 api 可以在服务端渲染中使用 在 vue3 中 setup
beforeMount 没用实际价值
mounted √ 表示组件挂载完成了 vm.$el 第一次渲染完毕了，等待渲染完毕后   mounted中可以获取$el
beforeUpdate
updated 更新前后
activated keep-alive
deactivated
beforeDestroy √ 手动调用移除会触发
destroyed √ 销毁后触发
errorCaptured 捕获错误

> 一般最多的在 mounted （created 不是比 mounted 早吗？ 代码是同步执行的，请求是异步的） 服务端渲染不都是在 created 中，真正使用服务端渲染的时候 基本上也不会使用 created （服务端没有 dom 也没有 mounted 钩子） 在哪里发请求主要看你要做什么事（请求的时候获取 dom 元素，都写在这里就可以的）

created 执行完之后再执行的 mounted 这个时候异步已经在 cteated 执行完了吧 错误的
因为生命周期是顺序调用的 （同步的） 请求是异步的 所以最终获取到数据肯定是在 mounted 之后的

## 7.`Vue.mixin`的使用场景和原理

我们可以通过 Vue.mixin 来实现逻辑的复用, 问题在于数据来源不明确。 声明的时候可能会导致命名冲突。 高阶组件， vue3 采用的就是 compositionAPI 解决了复用问题

```
Vue.mixin({
    data(){
        return {xxx:11}
    },
    beforeCreate(){
        this.$store = new Store();
    },
    beforeDestroy(){

    }
})
Vue.component('my',{
    data(){
        return { xxx:222}
    },
    template:'{{xxx}}'
})
```

> mixin 的核心就是合并属性 （内部采用了策略模式进行合并） 全局 mixin，局部 mixin。 针对不同的属性有不同的合并策略

## 8.`Vue`组件 data 为什么必须是个函数？

原因就在于针对根实例而言，new Vue, 组件是通过同一个构造函数多次创建实例，如果是同一个对象的话那么数据会被互相影响。 每个组件的数据源都是独立的，那就每次都调用 data 返回一个新的对象

```js
const Vue = {};
Vue.extend = function (options) {
  function Sub() {
    this.data = this.constructor.options.data();
  }
  Sub.options = options;
  return Sub;
};

let Child = Vue.extend({
  data() {
    return { a: 1 };
  },
});
let c1 = new Child();
c1.data.a = 100;
let c2 = new Child();
console.log(c2.data.a);
```

## 9.`nextTick`在哪里使用？原理是?

nextTick 内部采用了异步任务进行了包装 （多个 nextTick 调用 会被合并成一次 内部会合并回调）最后在异步任务中批处理
主要应用场景就是异步更新 （默认调度的时候 就会添加一个 nextTick 任务） 用户为了获取最终的渲染结果需要在内部任务执行之后在执行用户逻辑
这时候用户需要将对应的逻辑放到 nextTick 中

## 10.`computed`和`watch`区别

computed 和 watch 的相同点。 底层都会创建一个 watcher (用法的区别 computed 定义的属性可以在模板中使用,watch 不能在视图中使用)

- computed 默认不会立即执行 只有取值的时候才会执行 内部会维护一个 dirty 属性 来控制依赖的值是否发生变化。 默认计算属性需要同步返回结果 ( 有个包 就是让 computed 变成异步的)
- watch 默认用户会提供一个回调函数，数据变化了就调用这个回调。 我们可以监控某个数据的变化 数据变化了执行某些操作

## 11.`Vue.set`方法是如何实现的

Vue.set 方法是 vue 中的一个补丁方法 （正常我们添加属性是不会触发更新的， 我们数组无法监控到索引和长度）

如何实现的 我们给每一个对象都增添了一个 dep 属性

> vue3 中也不需要此方法了 (当属性添加或者删除时 手动触发对象本身 dep 来进行更新)

## 12.`Vue`为什么需要虚拟 DOM

- 主要这个虚拟 dom 的好处是什么？ 我们写的代码可能要针对不同的平台来使用 （weex，web，小程序） 可以跨平台，不需要考虑平台问题
- 不用关心兼容性问题， 可以在上层将对应的渲染方法传递给我 ， 我来通过虚拟 dom 渲染即可

- diff 算法 针对更新的时候， 有了虚拟 dom 之后我们可以通过 diff 算法来找到最后的差异进行修改真实 dom （类似于在真实 dom 之间做了一个缓存）

> 跨平台 、diff 算法

## 13.`Vue`中`diff`算法原理

diff 算法的特点就是平级比较 ， 内部采用了双指针方式进行了优化 优化了常见的操作。 采用了递归比较的方式

### 针对一个节点的 diff 算法

- 先拿出根节点来进行比较如果是同一个节点则比较属性 ， 如果不是同一个节点则直接换成最新的即可
- 同一个节点比较属性后，复用老节点

### 比较儿子

- 一方有儿子 一方没儿子 （删除 、 添加）
- 两方都有儿子
  - 优化比较 头头 尾尾 交叉比对
  - 就做一个映射表，用新的去映射表中查找此元素是否存在，存在则移动不存在则插入， 最后删除多余的
  - 这里会有多移动的情况

> O(n)复杂度的递归比较

## 14.既然 Vue 通过数据劫持可以精准探测数据变化，为什么还需要虚拟 DOM 进行`diff`检测差异

- 如果给每个属性都去增加 watcher , 而且粒度太小也是不好控制, 降低 watcher 的数量 （每一个组件都有一个 watcher） 可以通过 diff 算法来优化渲染过程。 通过 diff 算法和响应式原理折中处理了一下

## 15.请说明 Vue 中 key 的作用和原理，谈谈你对它的理解

isSameVnode 中会根据 key 来判断两个元素是否是同一个元素，key 不相同说明不是同一个元素 （key 在动态列表中不要使用索引 -》 bug）
我们使用 key 尽量要保证 key 的唯一性 （这样可以优化 diff 算法）

## 16.谈一谈对 Vue 组件化的理解

组件的优点： 组件的复用可以根据数据渲染对应的组件 ， 把组件相关的内容放在一起 （方便复用）合理规划组件，可以做到更新的时候是组件级更新 (组件化中的特性 属性， 事件， 插槽)

> Vue 中怎样处理组件 1） Vue.extend 根据用户的传入的对象生成一个组件的构造函数 2） 根据组件产生对应的虚拟节点 data:{hook:init} 3）做组件初始化 将我们的虚拟节点转化成真实节点 （组件的 init 方法） new Sub().$mount()

## 17.`Vue`的组件渲染流程 （init）

- vm.$options.components['my'] = {my:模板}
- 创造组件的虚拟节点 createComponent {tag:'my',data:{hook:{init}},componentOptions:{Ctor:Vue.extend( {my:模板})}}
- 创造真实节点的 createComponent init -> new 组件().$mount() -> vm.componentInstance
- vm.$el 插入到父元素中

## 18.`Vue`组件更新流程 （prepatch）

- 组件更新会触发 组件的 prepatch 方法，会复用组件，并且比较组件的 属性 事件 插槽
- 父组件给子组件传递的属性是(props) 响应式的 , 在模板中使用会做依赖收集 收集自己的组件 watcher
- 稍后组件更新了 会重新给 props 赋值 ， 赋值完成后会触发 watcher 重新更新

## 19.`Vue`中异步组件原理

Vue 中异步组件的写法有很多， 主要用作。大的组件可以异步加载的 markdown 组件 editor 组件。 就是先渲染一个注释标签，等组件加载完毕，最后在重新渲染 forceUpdate (图片懒加载) 使用异步组件会配合 webpack

> 原理： 异步组件默认不会调用 Vue.extend 方法 所有 Ctor 上没有 cid 属性， 没有 cid 属性的就是异步组件。 会先渲染一个占位符组件. 但是如果有 loading 会先渲染 loading ， 第一轮就结束了。 如果用户调用了 resolve， 会将结果赋予给 factory.resolved 上面， 强制重新渲染。 重新渲染时候再次进入到 resolveAsyncComponent 中， 会直接拿到 factory.resolved 结果来渲染

## 20.函数组件的优势及原理

> React 中也区分两种组件 一种叫类组件 ， 一种叫函数式组件 （Sub 就是类组件 有 this） （函数组件 没有类就没有 this，也没有所谓的状态，没有生命周期 beforeCreate created..., 好处就是性能好， 不需要创建 watcher 了） 函数式组件就是调用 render 拿到返回结果来渲染， 所以性能高

## 21.Vue 组件间传值的方式及之间区别

- props 父传递数据给儿子 属性的原理就是把解析后的 props，验证后就会将属性定义在当前的实例上 vm.\_props (这个对象上的属性都是通过 defineReactive 来定义的 （都是响应式的） 组件在渲染的过程中会去 vm 上取值 \_props 属性会被代理到 vm 上)
- emit 儿子触发组件更新 在创建虚拟节点的时候将所有的事件 绑定到了 listeners ， 通过$on 方法绑定事件 通过$emit 方法来触发事件 (发布订阅模式)
- events Bus 原理就是 发布订阅模式 $bus = new Vue() 简单的通信可以采用这种方式
- $parent $children  就是在创造子组件的时候 会将父组件的实例传入。 在组件本身初始化的时候会构建组件间的父子关系 $parent获取父组件的实例，通过$children 可以获取所有的子组件的实例

- ref 可以获取 dom 元素和组件的实例 （虚拟 dom 没有处理 ref， 这里无法拿到实例 也无法获取组件） 创建 dom 的时候如何处理 ref 的。 会将用户所有的 dom 操作及属性 都维护到一个 cbs 属性中 cbs (create update insert destroy....)。 依次调用 cbs 中 create 方法。 这里就包含 ref 相关的操作， 会操作 ref 并且赋值

- provide （在父组件中将属性暴露出来）inject 在后代组件中通过 inject 注入属性 在父组件中提供数据， 在子组件中递归向上查找

- $attrs (所有的组件上的属性 不涵盖 props) $listeners (组件上所有的事件)
- Vue.observalble 可以创造一个全局的对象用于通信 用的也少
- vuex

## 22.v-if 和 v-for 哪个优先级更高？

```js
function render() {
  with (this) {
    return _c(
      "div",
      _l(3, function (i) {
        return flag ? _c("span") : _e();
      }),
      0
    );
  }
}
```

> v-for 的优先级更高 ，在编译的时候 会将 v-for 渲染成\_l 函数 v-if 会变成三元表达式。 v-if 和 v-for 不要在一起使用。

v-if (控制是否渲染) / v-show(控制的是样式 viisbility:hidden display:none ?) v-show=“true" 放在 span 上会变成块元素吗？ 为什么不用 viisbility:hidden? 不能响应事件 (占位的) 为什么比用 opacity 呢？ （透明度为 0 占位） 可以响应事件的

> v-if 在编译的时候 会变成三元表达式 但是 v-show 会变成一个指令

## 23.v-if，v-model，v-for 的实现原理

- v-if 会被编译成 三元表达式
- v-for 会被编译成\_l 循环
- v-model 干什么的？ 放在表单元素上可以实现双向绑定 ， 放在组件上就不一样了

  - v-model 放在不同的元素上会编译出不同的结果，针对文本来说会处理文本 （会被编译成 value + input + 指令处理） value 和 input 实现双向绑定阻止中文的触发 指令作用就是处理中文输入完毕后 手动触发更新

  - v-model 绑定到组件上 这里会编译一个 model 对象 组件在创建虚拟节点的时候会里有这个 对象。 会看一下里面是否有自定义的 prop 和 event ，如果没有则会被解析成 value + input 的语法糖

## 27.Vue 中.sync 修饰符的作用，用法及实现原理

- 和 v-model 一样，这个 api 是为了实现状态同步的， 这个东西在 vue3 中被移除了

```js
function render() {
  with (this) {
    return _c("my", {
      attrs: {
        xx: info,
      },
      on: {
        "update:xx": function ($event) {
          info = $event;
        },
      },
    });
  }
}
```

## 25.Vue.use 是干什么的？原理是什么？

- 这里的 use 方法 目的就是将 vue 的构造函数传递给插件中，让所有的插件依赖的 Vue 是同一个版本
- 默认调用插件 默认调用插件的 install 方法
- vue-router 和 vuex 里面的 package 的依赖里面没有 vue 是吧。是通过参数穿进去的

## 30.组件中写 name 选项有哪些好处及作用？

### 可以实现递归组件

- 在 vue 中有 name 属性的组件可以被递归调用 （在写模板语法的时候 我们可以通过 name 属性来递归调用自己）
- 在声明组件的时候 Sub.options.components[name] = Sub

### 起到标识作用

- 我们用来标识组件 通过 name 来找到对应的组件 . 自己封装跨级通信
- name 属性可以用作 devtool 调试工具 来标明具体的组件

## 24.Vue 中 slot 是如何实现的？什么时候使用它？

- 普通插槽 （普通插槽渲染作用域在父组件中的）

  - 在解析组件的时候会将组件的 children 放到 componentOptions 上作为虚拟节点的属性
  - 将 children 取出来放到组件的 vm.$options.\_renderChildren 中
  - 做出一个映射表放到 vm.$slots上  -> 将结果放到 vm.$scopeSlots 上 vm.$scopeSlots = {a:fn,b:fn,default:fn}
  - 渲染组件的时候会调用\_t 方法 此时会去 vm.$scopeSlots 找到对应的函数来渲染内容

- 具名插槽 多增加了个名字
- 作用域插槽（普通插槽渲染作用域在子组件中的）
  - 我们渲染插槽选择的作用域是子组件的 作用域插槽渲染的时候不会作为 children, 将作用域插槽做成了一个属性 scopedSlots
  - 制作一个映射关系 $scopedSlots = {default:fn:function({msg}){return \_c('div',{},[_v(_s(msg))])}}}
  - 稍后渲染组件的模板的时候 会通过 name 找到对应的函数 将数据传入到函数中此时才渲染虚拟节点， 用这个虚拟节点替换\_t('default')

> vm.$scopeSlots {key:fn}   vm.$slots = {key:[vnode]}

## 29.keep-alive 平时在哪里使用？原理是？

- 1.keep-alive 在路由中使用
- 2.在 component:is 中使用 （缓存）

- keep-alive 的原理是默认缓存加载过的组件对应的实例 内部采用了 LRU 算法
- 下次组件切换加载的时候 此时会找到对应缓存的节点来进行初始化，但是会采用上次缓存$el 来触发 （不用在做将虚拟节点转化成真实节点了） 通过 init -》 prepatch 中了
- 更新和销毁会触发 actived 和 deactived

## 28.如何理解自定义指令

- 自定义指令就是用户定义好对应的钩子，当元素在不同的状态时会调用对应的钩子 （所有的钩子会被合并到 cbs 对应的方法上， 到时候依次调用）

## 26.Vue 事件修饰符有哪些？其实现原理是什么？

- 实现主要靠的是模板编译原理 addEventListener( stop , defaultPrevent ) self capture passvie once
- .number

### 编译的时候直接编译到事件内部了

- <div @click.prevent></div>
- <div @click.stop></div>

### 编译的时候增加标识 !~&

- <div @click.passive></div>
- <div @click.capture></div>
- <div @click.one></div>

### 键盘事件

- 都是通过模板编译来实现的，没有特殊的
