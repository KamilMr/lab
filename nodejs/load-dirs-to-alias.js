#!/usr/bin/env node
// this repository build aliases for the projects to ease navigate from terminal

const fs = require("fs");
const path = require("path");

const ROOT_DIR = "/Users/kamilmrowka/Work";
const MAX_DEPTH = 1;
const START_DEPTH = 0;

const getPath = (...parts) => path.join(...parts);
const buildAlias = (name, path) => `alias ${name.toLowerCase()}="cd ${path}"`;

// filter out not directories
const isDir = (path) => fs.statSync(path).isDirectory();

const recursivelyMapDirs = (path, depth = START_DEPTH, tR = []) => {
  const files = fs.readdirSync(path);
  const dirs = files.filter(
    (item) => isDir(getPath(path, item)) && !item.startsWith(".")
  );
  for (const dirName of dirs) {
    const dirPath = getPath(path, dirName);
    const alias =
      depth === 0
        ? buildAlias(dirName, dirPath)
        : buildAlias(`${path.split("/").pop()}-${dirName}`, dirPath);
    tR.push(alias);
    if (depth < MAX_DEPTH) recursivelyMapDirs(dirPath, depth + 1, tR);
  }

  return tR;
};

const resp = recursivelyMapDirs(ROOT_DIR, START_DEPTH);

resp.forEach((alias) => {
  console.log(alias);
});
