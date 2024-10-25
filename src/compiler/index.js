import { generate } from './codegen';
import { parse } from './parse';

// 将模板变成render函数，通过with+new Function的方式让字符串变成js语法来执行
export function compileToFunctions(template) {
  const ast = parse(template);

  // 通过ast语法树转换成render函数
  const code = generate(ast);

  // 使用with改变作用域为this
  const renderFn = new Function(`with(this) {return ${code}}`);
  return renderFn;
}

// 将template转换成ast语法树, 再将语法树转换成一个字符串拼接在一起
// ast用来描述语言本身，语法中没有的，不会被描述出来
// vdom描述真实dom元素，可以自己添加属性
