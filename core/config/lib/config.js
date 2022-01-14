"use strict";
const userHome = require("user-home");
const path = require("path");
const fs = require("fs");

function config() {
  const conPath = path.join(userHome, ".ape-cli-dev/config.js");
  if (fs.existsSync(conPath)) {
    const reCon = require(conPath);
    return reCon;
  } else {
    throw new Error("没有配置文件，请联系管理员");
  }
}
module.exports = config;
