/* @flow */

import Dep from "./dep";
import VNode from "../vdom/vnode";
import { arrayMethods } from "./array";
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering,
} from "../util/index";

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true;

export function toggleObserving(value: boolean) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor(value: any) {
    this.value = value;
    this.dep = new Dep(); // 这里会给对象创建dep  数组也会创建
    this.vmCount = 0;
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      // 如果是数组
      if (hasProto) {
        // 则重写数组的方法
        protoAugment(value, arrayMethods);
      } else {
        // 不支持直接拷贝
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value); // 对象就要迭代对象
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk(obj: Object) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]); // 将每个key定义成响应式的
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment(target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    // 观测的人必须是一个对象
    return;
  }
  let ob: Observer | void;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    // 并且不能是一个被观测过的属性
    ob = value.__ob__;
  } else if (
    shouldObserve && // 是否能被观测
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) && // 这个对象必须能被扩展
    !value._isVue
  ) {
    ob = new Observer(value); // 观测数据
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 */

// Vue.util.defineReactive（）
export function defineReactive(
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep();

  // 用户可能直接调用了defineReactive 方法定义属性  Object.freeze()
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get;
  const setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  let childOb = !shallow && observe(val); // 递归观测 如果val是一个对象的话 会让对象稍后也会进行依赖手机 并且对这个对象依次观测
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend(); // 稍后取值的时候会让对象本身进行依赖收集
        if (childOb) {
          childOb.dep.depend(); // 对象和数组本身是具备依赖收集的功能
          if (Array.isArray(value)) {
            dependArray(value); // 让数组的每一项都要进行依赖收集
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== "production" && customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return;
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal); // 如果设置的值又是一个对象那么还会依次观测
      dep.notify(); // 通知视图更新
    },
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */

// vm.$set(vm.age,'b',100);
export function set(target: Array<any> | Object, key: any, val: any): any {
  if (
    process.env.NODE_ENV !== "production" &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(
      `Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`
    );
  }

  // vm.age[0] = 100  -> vm.$set(vm.age,'b',100);  -> vm.age.splice(0,1,100)
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  if (key in target && !(key in Object.prototype)) {
    // vm.age.a =100;
    target[key] = val; // 已经有的属性直接修改即可
    return val;
  }
  const ob = (target: any).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    // data:{} vm.$set(vm,'a')
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid adding reactive properties to a Vue instance or its root $data " +
          "at runtime - declare it upfront in the data option."
      );
    return val;
  }
  if (!ob) {
    // 不是响应式的就直接添加
    target[key] = val;
    return val;
  }
  defineReactive(ob.value, key, val); // > vm.$set(vm.age,'b',{a:1});
  ob.dep.notify(); // 触发视图更新
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del(target: Array<any> | Object, key: any) {
  if (
    process.env.NODE_ENV !== "production" &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(
      `Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`
    );
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }
  const ob = (target: any).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid deleting properties on a Vue instance or its root $data " +
          "- just set it to null."
      );
    return;
  }
  if (!hasOwn(target, key)) {
    return;
  }
  delete target[key];
  if (!ob) {
    return;
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}
