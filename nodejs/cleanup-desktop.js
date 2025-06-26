#!/usr/bin/env node

const fs = require("fs");
const path = require("path");


const desktopPath = "/Users/kamilmrowka/Desktop";

const IMAGES = 'images';
const VIDEOS = 'videos';
const DOCUMENTS = 'documents';
const OTHER = 'other';

const MAIN_DIRS = [IMAGES, VIDEOS, DOCUMENTS, OTHER];

const files = fs.readdirSync(desktopPath);

const onlyFiles = files.filter((file) => !fs.statSync(path.join(desktopPath, file)).isDirectory());

// create directories for images, videos, documents
const imagesDir = path.join(desktopPath, IMAGES);
const videosDir = path.join(desktopPath, VIDEOS);
const documentsDir = path.join(desktopPath, DOCUMENTS);
const otherDir = path.join(desktopPath, OTHER);

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}
if (!fs.existsSync(otherDir)) {
  fs.mkdirSync(otherDir, { recursive: true });
}

onlyFiles.forEach((file) => {
  if (MAIN_DIRS.includes(file)) return;

  const filePath = path.join(desktopPath, file);

  const fileType = file.split(".").pop();

  if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") {
    fs.renameSync(filePath, path.join(imagesDir, file));
  } else if (fileType === "mp4" || fileType === "mov" || fileType === "avi") {
    fs.renameSync(filePath, path.join(videosDir, file));
  } else if (fileType === "doc" || fileType === "docx" || fileType === "pdf") {
    fs.renameSync(filePath, path.join(documentsDir, file));
  } else {
    fs.renameSync(filePath, path.join(otherDir, file));
  }
});
