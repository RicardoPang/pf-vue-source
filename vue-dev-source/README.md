0. 下载源代码
1. 安装 Vue 所需依赖 `npm install`
2. 运行开发环境, 实现代码调试 `npm run dev`
3. 增加 sourcemap 方便源代码调试

## 查看源码是怎样打包的

- Vue2 采用的是 flow 来编写的, Facebook 发明, 类似 ts, 实现代码的类型检测和标注
- scripts 放置的是打包的脚本
- src 源代码目录

  - compile 做编译的
  - core 核心目录
  - platform 平台代码(我要扩展 Vue 需要在 Vue 的源码目录下增加自己的代码)
  - sfc 解析.vue 文件
  - shared 一些共享的代码 常量...

- 通过 package.json 看到打包的时候采用的配置是 scripts/config.js
- 打包的时候会将源代码打包成不同的格式 `umd` `commonjs` `esm`
- 打包的时候会有两个入口 entry-runtime / entry-runtime-with-compile (在代码运行时候能否编译模板) 开发的是采用的.vue 文件 直接可以在打包的时候就被编译了 所以运行的时候不需要 with compiler
- 通过配置文件找到我们最终 Vue 的入口

## Vue 整个的扩展流程

![Vue生命周期](https://p.ipic.vip/lbjwim.png)

- 最终上线用的肯定是 entry-runtime, 可以减少与形式编译模板 .vue 文件在编译的时候会把 template 转换成 render 函数, 不需要运行时再转换了
- 对应 runtime-with-cpmpiler 而言, 先看 render -> template -> 外部的 template -> template 变成 render 函数(重写$mount) 如果不考虑编译过程直接看 runtime/index.js
- runtime/index.js 内部扩展乐平台代码的指令, **Vue.prototype** **pathch** **diff 算法**
- core/index.js initGlobalAPI 安装全局的 api
- /instance/index Vue 的构造函数

## 依赖收集原理

- 每个属性(动态)和对象类型都会配置一个 dep 属性 用作依赖收集
- 每个页面再选柔软的时候都会创造一个 watcher 渲染时会发生取值操作(回价格当前 watcher 放到全局上) 取值的时候就可以让 dep 和 watcher 创造关联
- 后续属性值发生变化后会让对应 watcher 重新渲染

## 总结

- 默认下载好后 先`npm install ` 安装依赖
- 代码的目录结构
- bechmarks 目录是做性能测试的
- dist 最终打包出的结果都放到了 dist 下
- examples 官方的例子
- flow 类型检测 （没人用了 和 ts 功能类似）
- packages 一些写好的包 (vue 源码中包含了 weex)
- scripts 所有打包的脚本都放在这里
- src 源代码目录

  - compiler 专门用作模板编译的
  - core vue2 的核心代码
  - platform
  - server 服务端渲染相关的
  - sfc 解析单文件组件的
  - shared 就是模块之间的共享属性和方法

- 通过 package.json 找到打包入口
- scripts/config.js (web-full-dev, web-runtime-cjs-dev,web-runtime-esm....)
- 打包的入口
  - src/platforms/web/entry-runtime.js
  - src/platforms/web/entry-runtime-with-compiler.js （两个入口的区别是带有 compiler 的会重写$mount,将 template 变成 render 函数）
  - runtime/index.js （所谓的运行时 会提供一些 dom 操作的 api 属性操作、元素操作， 提供一些组件和指令）
  - core/index initGlobalAPI 初始化全局 api
  - /instance/index Vue 的构造函数

> 指定 sourcemap 参数 可以开启代码调试
