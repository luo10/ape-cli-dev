#! /usr/bin/env node
// 标识用node去执行

// 该文件为入口文件，只用来区分执行的文件

const importLocal = require("import-local"); // 引入本地版本

if (importLocal(__filename)) {
  // 如果有项目里面的npm包,则用项目里面的
  require("npmlog").info("cli", "正在使用项目内ape-cli");
} else {
  // 引入入口文件
  require("../lib/core.js")();
}
