const fs = require("fs");
const path = require("path");

const mainPackageJson = require("../../../esy.json");
const packageJson = JSON.stringify(
  {
    name: mainPackageJson.name,
    version: mainPackageJson.version,
    license: mainPackageJson.license,
    description: mainPackageJson.description,
    author: mainPackageJson.author,
    repository: mainPackageJson.repository,
    scripts: {
      postinstall: "node ./postinstall.js",
    },
    publishConfig: {
      access: "public",
    },
    bin: mainPackageJson.esy.release.bin.reduce((acc, curr) => {
      return Object.assign({ [curr]: "bin/" + curr }, acc);
    }, {}),
    files: [
      "platforms",
      "_export/",
      "bin/",
      "postinstall.js",
      "esyInstallRelease.js",
      "LICENSE",
      "README.md",
      "package.json",
      "package-lock.json",
    ],
  },
  null,
  2
);

fs.writeFileSync(
  path.join(__dirname, "..", "..", "..", "_release", "package.json"),
  packageJson,
  { encoding: "utf8" }
);
