import { compileToFunctions } from './compiler/index';
import { mergeOptions } from './gloablAPI';
import { callHook, mountComponent } from './lifecycle';
import { initState } from './state';

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // vue中会判断如果是$开头的属性不会被变成响应式数据
    this.$options = mergeOptions(vm.constructor.options, options); // 所有后续的扩展方法都有一个$options选项可以获取用户的所有选项
    console.log(this.$options);

    // 对于实例的数据源 props data methods computed watch
    // prop data
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');

    // 状态初始化完毕后需要进行页面挂载
    if (vm.$options.el) {
      // el属性和直接调用$mount是一样的
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    const options = vm.$options;
    if (!options.render) {
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
      }
      // 将template变成render函数
      // 创建render函数 => 虚拟dom => 渲染真实dom
      const render = compileToFunctions(template); // 开始编译
      options.render = render;
    }
    // 将当前组件实例挂载到真实的el节点上面
    return mountComponent(vm, el);
  };
}

// diff算法, 主要是两个虚拟节点的比对, 需要根据模板渲染出一个render函数, render函数可以返回一个虚拟节点, 数据更新了重新调用render函数, 可以再返回一个虚拟节点
