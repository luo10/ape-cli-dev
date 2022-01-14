"use strict";
const npmlog = require("npmlog"); // log 变换log的颜色
const { Command } = require("commander"); // 命令行参数工具
const program = new Command(); // 初始化命令行参数， 增加 init -d 之类的参数

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-06 23:41
 * @desc: 主流程
 */
function core() {
  try {
    prepare();
    registerCommand();
  } catch (err) {
    npmlog.error(err);
  }
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-06 23:40
 * @desc: 准备动作
 */
function prepare() {
  checkNodeVersion();
}

function checkNodeVersion() {
  const n = process.version.split(".")[0].slice(1); // 获取版本号
  if (n != 14) {
    throw new Error("请使用14.17.xx版本的node");
  }
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-08 17:24
 * @desc: 注册方法
 */
function registerCommand() {
  program.command("init").action(require("@ape-cli-dev/command-init")); // 设置格式
  program.command("ev4").action(require("@ape-cli-dev/command-ev4")); // 设置格式
  program.parse(process.argv); // 执行
}

module.exports = core;
