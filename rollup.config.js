import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

// 常见的模块规范 import export (ESModule) module.exports require (CommonJS)
// AMD 比较老的模块规范 systemjs 模块规范
// ES6Module commonjs umd 支持amd 和 cmd Vue)

export default {
  input: './src/index.js', // 打包项目的入口文件
  output: {
    format: 'umd', // 打包后的结果是umd模块规范
    file: 'dist/vue.js', // 打包出的文件结果放在哪个目录
    name: 'Vue', // 打包后的全局变量的名字
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    process.env.ENV === 'development'
      ? serve({
          open: true,
          openPage: '/public/index.html',
          port: 3000,
          contentBase: '',
        })
      : null,
  ],
};
