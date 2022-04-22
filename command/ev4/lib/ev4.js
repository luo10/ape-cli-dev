"use strict";
const inquirer = require("inquirer"); // 命令行ui控制，单选 多选
const simpleGit = require("simple-git"); // 操作git
const fse = require("fs-extra"); // path 路径
const path = require("path"); // path 路径
const npmlog = require("npmlog");
const { emptyDirNoGit, spawnAsync } = require("@ape-cli-dev/utils"); // 工具包
const CONFIG = require("@ape-cli-dev/core-config")();
const git = simpleGit(); // 注册git方法

async function ev4() {
  try {
    await prepare();
    await registerInquirer();
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
    str = await git.remote(["-v"]);
  } catch (err) {
    throw new Error("请在ev4开发目录下进行操作");
  }
  if (str.indexOf(CONFIG.ev4.dev) == -1) {
    throw new Error("请在ev4开发目录下进行操作");
  }
}

async function registerInquirer() {
  console.log(1111);
  await inquirer
    .prompt([
      {
        type: "list",
        name: "type",
        message: "请选择执行方法",
        choices: [
          { name: "本地启动:测试数据", value: "local-dev" },
          { name: "本地启动:正式数据", value: "local-pro" },
          { name: "新加功能", value: "new-feat" },
          { name: "正在开发的功能", value: "feat-list" },
          { name: "提交测试", value: "update-develop" },
          { name: "提交模拟", value: "update-pre-release" },
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
        await updateDevelop();
      }

      // 提交模拟
      if (answers.type == "update-pre-release") {
        await updatePreRelease();
      }

      // 提交正式
      if (answers.type == "update-production") {
        await updateProduction();
      }

      // 添加一个新功能
      if (answers.type == "new-feat") {
        await newFeat();
      }

      // 查看正在开发中的功能
      if (answers.type == "feat-list") {
        await featList();
      }
    });
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-14 13:28
 * @desc: 判断是否在develop分支
 * @param: {*} param0
 */
async function isInBranch(branch) {
  // to-do
  const { current } = await git.branchLocal();
  if (current != branch) {
    throw new Error(`请切换到${branch}分支操作`);
  }
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-15 11:48
 * @desc: 更新测试
 */
async function updateDevelop() {
  await isInBranch("develop");
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
      const buildPath = path.join(process.cwd(), "..", "edu_v4_vue_build");
      const buildGit = simpleGit({ baseDir: buildPath });
      await buildGit.checkout("develop"); // 切换测试分支
      await buildGit.pull(["origin", "develop"]); // 更新
      // 清空上线git
      emptyDirNoGit(buildPath);
      // 粘贴代码
      fse.copySync(path.join(process.cwd(), "dist"), buildPath);
      await buildGit.add(["."]); // 添加代码
      await buildGit.commit([updateAnswers.gittext]); // 打标记
      await buildGit.push(["origin", "develop"]); // 推送代码
    });
}

// 更新模拟
async function updatePreRelease() {
  await isInBranch("pre-release");
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
      await spawnAsync("npm", ["run", "build:pre"]);
      // 更新上线项目git
      const buildPath = path.join(process.cwd(), "..", "edu_v4_vue_build");
      const buildGit = simpleGit({ baseDir: buildPath });
      await buildGit.checkout("pre-release"); // 切换测试分支
      await buildGit.pull(["origin", "pre-release"]); // 更新
      // 清空上线git
      emptyDirNoGit(buildPath);
      // 粘贴代码
      fse.copySync(path.join(process.cwd(), "dist"), buildPath);
      await buildGit.add(["."]); // 添加代码
      await buildGit.commit([updateAnswers.gittext]); // 打标记
      await buildGit.push(["origin", "pre-release"]); // 推送代码
    });
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-15 11:51
 * @desc: 更新上线
 * @param: {*} param0
 */
async function updateProduction() {
  await isInBranch("master");
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
      await git.add(".");
      await git.commit("提交上线版本号");
      await git.push(["origin", "master"]);

      // 打包
      await spawnAsync("npm", ["run", "build:pro"]);

      // 更新上线项目git
      const buildPath = path.join(process.cwd(), "..", "edu_v4_vue_build");

      const buildGit = simpleGit({ baseDir: buildPath });
      await buildGit.checkout("master");
      await buildGit.pull(["origin", "master"]);

      // 清空上线git
      emptyDirNoGit(buildPath);
      // 粘贴代码
      fse.copySync(path.join(process.cwd(), "dist"), buildPath);

      await buildGit.add(".");
      await buildGit.commit(updateAnswers.gittext);
      await buildGit.push(["origin", "master"]);
    });
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-15 11:55
 * @desc: 添加新功能
 */
async function newFeat() {
  // 确保在master上切出分支
  await isInBranch("master");
  inquirer
    .prompt([
      {
        type: "input",
        name: "newbranch",
        message: "请输入更新内容",
      },
    ])
    .then(async (answers) => {
      git.pull(["origin", "master"]); // 更新分支
      git.checkout(["-b", answers.newbranch]); //创建新分支
    });
}

/**
 * @Author: luo1o1o1o
 * @Date: 2022-01-15 12:16
 * @desc: 正在发开中的功能
 */
async function featList() {
  const { all } = await git.branchLocal();
  console.log(all, 99);
}

module.exports = ev4;
