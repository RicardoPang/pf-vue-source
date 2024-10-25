const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

export function parse(html) {
  let root; // 树的操作，需要根据开始标签和结束标签产生一棵树
  // 如何构建树的父子关系
  let stack = [];
  while (html) {
    // 一个个字符来解析将结果跑出去
    let textEnd = html.indexOf('<');
    if (textEnd === 0) {
      const startTagMatch = parseStartTag(); // 解析开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let matches;
      if ((matches = html.match(endTag))) {
        // </div> 不是开始就会走到结束
        end(matches[1]);
        advance(matches[0].length);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      chars(text);
    }
  }
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      attrs,
      children: [],
      parent: null,
      type: 1,
    };
  }
  function start(tagName, attrs) {
    const element = createASTElement(tagName, attrs);
    if (root == null) {
      root = element;
    }
    const parent = stack[stack.length - 1]; // 取到栈中最后一个
    if (parent) {
      element.parent = parent; // 让这个元素记住自己的父亲是谁
      parent.children.push(element); // 让父亲记住儿子是谁
    }
    // 将原素放到栈中
    stack.push(element);
  }
  function end(tagName) {
    stack.pop();
  }
  function chars(text) {
    text = text.replace(/\s/g, '');
    if (text) {
      const parent = stack[stack.length - 1];
      parent.children.push({
        type: 3,
        text,
      });
    }
  }
  function parseStartTag() {
    const matches = html.match(startTagOpen);
    if (matches) {
      const match = {
        tagName: matches[1],
        attrs: [],
      };
      advance(matches[0].length);
      // 继续解析开始标签的属性
      let end, attr;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        // 只要没有匹配到结束标签就一直匹配
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
        advance(attr[0].length); // 解析一个属性删除一个
      }
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }
  function advance(n) {
    html = html.substring(n); // 每次根据传入的长度截取html
  }
  return root;
}
