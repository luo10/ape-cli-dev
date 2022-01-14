"use strict";
const { spawn } = require("child_process"); // 子进程
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-12 15:08
 * @desc: 获取名称从git地址
 */
function dirnameForGit(path) {
  // 例子 git@codeup.aliyun.com:61407505f6fabb78efa41002/edu_v4_vue.git
  const p = path.split("/"); // 第一次分割
  const str = p[p.length - 1]; // edu_v4_vue.git
  const name = str.split(".")[0]; // edu_v4_vue
  return name;
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-12 23:12
 * @desc: 清空文件夹，但是不删除git文件
 */
function emptyDirNoGit(path) {
  let files = [];
  // 路劲是否存在
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      // 不包含git文件则删除
      if (file.indexOf("git") == -1) {
        const curPath = path + "/" + file;
        fse.removeSync(curPath);
      }
    });
  }
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-13 14:29
 * @desc: 相对路径变绝对路径
 */
function relPath() {
  let re = path.join(process.cwd(), ...arguments);
  return re;
}
/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-10 18:59
 * @desc: 执行代码
 */
function spawnAsync(cmd, args, option = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd: process.cwd(),
      stdio: "inherit", // 是否显示到主进程
      ...option,
    });
    // 用pipe才能接收返回的数据
    if (option.stdio == "pipe") {
      p.stdout.on("data", (data) => {
        resolve(data.toString());
      });
      p.stderr.on("data", (data) => {
        reject(data.toString());
      });
    }
    // 子进程监听回调
    // p.on("spawn", (data) => {
    //   console.log(`info: ${data}`);
    // });

    // 子进程监听回调
    p.on("error", (data) => {
      console.error(`错误: ${data}`);
      reject(data);
    });

    // 子进程监听回调
    p.on("exit", (code) => {
      resolve(code);
    });
  });
}

module.exports = {
  emptyDirNoGit,
  dirnameForGit,
  relPath,
  spawnAsync,
};
