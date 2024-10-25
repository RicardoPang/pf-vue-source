const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

// 处理attrs属性
function genProps(attrs) {
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 特殊属性 style
    if (attr.name === 'style') {
      const obj = {};
      attr.value.split(';').reduce((memo, current) => {
        const [key, value] = current.split(':');
        memo[key] = value;
        return memo;
      }, obj);
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  if (node.type === 1) {
    return generate(node);
  } else {
    const text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`; // 不带表达式
    } else {
      const tokens = [];
      let match;
      // exec 遇到全局匹配会有 lastIndex 问题，每次匹配谦虚要将lastIndex置为0
      let startIndex = (defaultTagRE.lastIndex = 0);
      while ((match = defaultTagRE.exec(text))) {
        const endIndex = match.index; // 匹配到的索引 abc ｛｛aa｝｝ {{bb}} cd
        if (endIndex > startIndex) {
          tokens.push(JSON.stringify(text.slice(startIndex, endIndex)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        startIndex = endIndex + match[0].length;
      }
      if (startIndex < text.length) {
        // 将最后的尾巴也丢进去
        tokens.push(JSON.stringify(text.slice(startIndex)));
      }
      return `_v(${tokens.join('+')})`; // 组合成最终的语法
    }
  }
}

// 生成子节点，递归创建
function genChildren(el) {
  const children = el.children;
  if (children) {
    return `${children.map((child) => gen(child)).join(',')}`;
  }
}

export function generate(el) {
  // 字符串拼接
  const children = genChildren(el);
  let code = `_c('${el.tag}',${
    el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
  }${children ? `,${children}` : ''})`; // _c('div', {className: 'xxx'}, _v('hello world'))
  return code;
}
