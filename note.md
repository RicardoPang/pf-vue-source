## 1. 整个依赖收集过程

- 我们会走 defineReactive 方法把每个属性进行劫持, 我们给每个属性都配置了一个 dep(dep 的目的是为了收集 watcher)
- 开始渲染组件之前, 我把组件渲染的 watcher 绑定到了 Dep.target 上
- 开始渲染逻辑会调用 render 方法, 此时会发生取值操作, 肯定会触发 get 方法, 此时 Dep.target 有值, 我就让 dep 和 watcher 创建关系
- 我们会得到属性中对应的 dep 中存放一个数组 watchers 用来存储哪个 watcher 用到了此属性, 同样 watcher 也会存储着所依赖的所有属性 deps

> 每个属性有一个 dep, dep 记住了对应的 watcher(watcher 就是渲染逻辑)
