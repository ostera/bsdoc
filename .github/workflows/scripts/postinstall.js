#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const packageJson = require("./package.json");
const packageFiles = packageJson.files.map((f) =>
  f[f.length - 1] === "/" ? f.substring(0, f.length - 1) : f
);

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

fs.readdirSync("./").filter(notInPackage).map(rm);
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
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
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

function rm(path) {
  if ("rmSync" in fs) {
    return fs.rmSync(path, { force: true, recursive: true });
  }
  const stats = fs.statSync(path);
  if (stats.isDirectory) {
    fs.rmdirSync(path, { recursive: true });
  } else {
    fs.unlinkSync(path);
  }
}

function notInPackage(filename) {
  return packageFiles.indexOf(filename) === -1;
}
