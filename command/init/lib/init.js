"use strict";
const inquirer = require("inquirer"); // 命令行ui控制，单选 多选
const path = require("path"); // path 路径
const CONFIG = require("@ape-cli-dev/core-config")(); // 配置
const { relPath, spawnAsync, dirnameForGit } = require("@ape-cli-dev/utils"); // 工具包

function init() {
  // 当init执行,选择项目
  inquirer
    .prompt([
      {
        type: "list",
        name: "project",
        message: "请选择安装的项目",
        choices: [{ name: "ev4", key: "ev4" }],
      },
    ])
    .then((answers) => {
      // 获取配置
      // git 拉取
      installProject(CONFIG[answers.project]);
    });
}
/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-12 14:57
 * @desc: 安装项目，并且npm install
 */
async function installProject(config) {
  try {
    await spawnAsync("git", ["clone", config.dev]);
    const name = dirnameForGit(config.dev); // 获取git地址
    await spawnAsync(
      "npm",
      ["install", "--registry=https://registry.npmmirror.com"],
      { cwd: relPath(name) }
    ); // 安装npm依赖包

    // 拉取上线目录
    spawnAsync("git", ["clone", config.pro]);
  } catch (err) {
    console.log(`错误：${err}`);
  }
}
module.exports = init;
