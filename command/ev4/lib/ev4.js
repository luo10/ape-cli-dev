"use strict";
const inquirer = require("inquirer"); // 命令行ui控制，单选 多选
const fse = require("fs-extra"); // path 路径
const path = require("path"); // path 路径
const npmlog = require("npmlog");
const { emptyDirNoGit, spawnAsync } = require("@ape-cli-dev/utils"); // 工具包
const CONFIG = require("@ape-cli-dev/core-config")();

async function ev4() {
  try {
    await prepare();
    registerInquirer();
  } catch (err) {
    npmlog.error(err.message);
  }
}

async function prepare() {
  await checkDir();
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-14 11:03
 * @desc: 检查是否在ev4仓库内执行
 */
async function checkDir() {
  let str;
  try {
    str = await spawnAsync("git", ["remote", "-v"], { stdio: "pipe" });
  } catch (err) {
    throw new Error("该目录没有git，请链接git仓库后重试");
  }
  if (str.indexOf(CONFIG.ev4.dev) == -1) {
    throw new Error("请在ev4开发目录下进行操作");
  }
}

function registerInquirer() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "type",
        message: "请选择执行方法",
        choices: [
          { name: "本地启动:测试数据", value: "local-dev" },
          { name: "本地启动:正式数据", value: "local-pro" },
          // { name: "新加功能", value: "git-new" },
          { name: "提交测试", value: "update-develop" },
          { name: "提交正式", value: "update-production" },
        ],
      },
    ])
    .then(async (answers) => {
      // 本地启动:测试数据
      if (answers.type == "local-dev") {
        spawnAsync("npm", ["run", "serve:dev"]);
      }
      // 本地启动:正式数据
      if (answers.type == "local-pro") {
        spawnAsync("npm", ["run", "serve:pro"]);
      }

      // 提交测试
      if (answers.type == "update-develop") {
        isDevelopGit();
        inquirer
          .prompt([
            {
              type: "input",
              name: "gittext",
              message: "请输入更新内容",
            },
          ])
          .then(async (updateAnswers) => {
            // 打包
            await spawnAsync("npm", ["run", "build:dev"]);
            // 更新上线项目git
            const buildPath = path.join(
              process.cwd(),
              "..",
              "edu_v4_vue_build"
            );
            await spawnAsync("git", ["checkout", "develop"], {
              cwd: buildPath,
            }); // 切测试分支
            // 更新
            await spawnAsync("git", ["pull", "origin", "develop"], {
              cwd: buildPath,
            });
            // 清空上线git
            emptyDirNoGit(buildPath);
            // 粘贴代码
            fse.copySync(path.join(process.cwd(), "dist"), buildPath);
            await spawnAsync("git", ["add", "."], { cwd: buildPath }); // 添加代码
            await spawnAsync("git", ["commit", "-m", updateAnswers.gittext], {
              cwd: buildPath,
            }); // 打标记
            await spawnAsync("git", ["push", "origin", "develop"], {
              cwd: buildPath,
            }); // 推送代码
          });
      }

      // 提交正式
      if (answers.type == "update-production") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "gittext",
              message: "请输入更新内容",
            },
          ])
          .then(async (updateAnswers) => {
            // 设置版本号 +1 到3重复循环
            let { verson } = fse.readJsonSync("./verson.json");
            verson = (verson + 1) % 3;
            fse.writeJsonSync("./verson.json", { verson: verson });

            // 把本地修改版本号提交
            await spawnAsync("git", ["add", "."]);
            await spawnAsync("git", ["commit", "-m", "提交上线版本号"]);
            await spawnAsync("git", ["push", "origin", "master"]);

            // 打包
            await spawnAsync("npm", ["run", "build:pro"]);
            // 更新上线项目git
            const buildPath = path.join(
              process.cwd(),
              "..",
              "edu_v4_vue_build"
            );
            await spawnAsync("git", ["checkout", "master"], {
              cwd: buildPath,
            }); // 切测试分支
            // 更新
            await spawnAsync("git", ["pull", "origin", "master"], {
              cwd: buildPath,
            });
            // 清空上线git
            emptyDirNoGit(buildPath);
            // 粘贴代码
            fse.copySync(path.join(process.cwd(), "dist"), buildPath);
            await spawnAsync("git", ["add", "."], { cwd: buildPath }); // 添加代码
            await spawnAsync("git", ["commit", "-m", updateAnswers.gittext], {
              cwd: buildPath,
            }); // 打标记
            await spawnAsync("git", ["push", "origin", "master"], {
              cwd: buildPath,
            }); // 推送代码
          });
      }
    });
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-14 13:28
 * @desc: 判断是否在develop分支
 * @param: {*} param0
 */
async function isDevelopGit() {
  // to-do
}
module.exports = ev4;
