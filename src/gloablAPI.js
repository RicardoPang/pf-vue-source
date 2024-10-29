export default function initGlobalAPI(Vue) {
  Vue.options = {};
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options);
    return this;
  };
}

const strats = {};
const LIFECYCLE = ['beforeCreate', 'created'];

LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      // 如果儿子有 父亲有 让父亲和儿子拼在一起
      if (p) {
        return p.concat(c); // 最终八生命周期都合并在一起了
      } else {
        return [c]; // 儿子有父亲没有 则将儿子包装秤数组
      }
    } else {
      return p; // 如果儿子没有则用父亲即可
    }
  };
});

export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    // 循环老的
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    // 策略模式 减少if-else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // 如果不在测量中则以儿子为主
      options[key] = child[key] || parent[key]; // 优先采用儿子 再采用父亲
    }
  }
  return options;
}
