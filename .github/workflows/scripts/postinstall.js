#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PROG = "bsdoc";

var arch = process.arch;
var platform = process.platform;

if (arch === "ia32") {
  arch = "x86";
}

if (platform === "win32") {
  platform = "win";
}

const platformPath = `${platform}-${arch}`;

const filename = `platforms/${platformPath}/bin/${PROG}`;

const supported = fs.existsSync(filename);

if (!supported) {
  console.error(`${PROG} does not support this platform :(`);
  console.error("");
  console.error(`${PROG} comes prepacked as built binaries to avoid large`);
  console.error("dependencies at build-time.");
  console.error("");
  console.error(`If you want ${PROG} to support this platform natively,`);
  console.error("please open an issue at our repository, linked above. Please");
  console.error(`specify that you are on the ${platform} platform,`);
  console.error(`on the ${arch} architecture.`);
  process.exit(1);
}

copyRecursiveSync(`platforms/${platformPath}/_export`, "./_export");
copyRecursiveSync(`platforms/${platformPath}/bin`, "./bin");
copyRecursiveSync(
  `platforms/${platformPath}/esyInstallRelease.js`,
  "./esyInstallRelease.js"
);

if (platform == "win") {
  fs.chmodSync(`bin/${PROG}.exe`, 0755);
} else {
  fs.chmodSync(`bin/${PROG}`, 0755);
}

require("child_process").fork("./esyInstallRelease.js");

function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
