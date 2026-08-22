const fs = require("node:fs");
const crypto = require("node:crypto");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { Readable, Transform, Writable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const sharp = require("sharp");
const FilterStream = require("./filter-draft");
const { addSuggestedTitle } = require("./title-suggestions");

const IMAGE_ATTACHMENT_PATH = "attachments";

const assertExists = (p) => {
  const abs = resolveRelative(p);
  if (!fs.existsSync(abs)) throw new Error(`${abs} does not exist`);
};

const resolveRelative = (p) => {
  if (path.isAbsolute(p)) return p;

  return path.resolve(process.cwd(), p);
};

const replaceAsync = async (value, pattern, replacer) => {
  const matches = [...value.matchAll(pattern)];
  let result = "";
  let lastIndex = 0;

  for (const match of matches) {
    result += value.slice(lastIndex, match.index);
    result += await replacer(...match);
    lastIndex = match.index + match[0].length;
  }

  return result + value.slice(lastIndex);
};

const RASTER_FORMATS = new Set(["avif", "gif", "heif", "jpeg", "jxl", "png", "tiff", "webp"]);
const HASHED_WEBP = /^[a-f0-9]{12}\.webp$/;

const parseEmbed = (inner) => {
  const separator = inner.indexOf("|");
  if (separator === -1) return { attachment: inner, alias: "" };

  return {
    attachment: inner.slice(0, separator),
    alias: inner.slice(separator + 1),
  };
};

const defaultAlt = (attachment) =>
  path.parse(attachment).name.toLowerCase().replace(/[\s.]/g, "-");

const getRasterFormat = async (imagePath) => {
  try {
    const { format } = await sharp(imagePath).metadata();
    return RASTER_FORMATS.has(format) ? format : null;
  } catch {
    return null;
  }
};

const isInside = (directory, candidate) => {
  const relative = path.relative(directory, candidate);
  return relative && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
};

const getAttachmentFile = (attachmentDirectory, realAttachmentDirectory, attachment) => {
  if (!realAttachmentDirectory) return null;

  const attachmentPath = path.resolve(attachmentDirectory, attachment);
  if (!isInside(attachmentDirectory, attachmentPath) || !fs.existsSync(attachmentPath)) return null;

  const stat = fs.statSync(attachmentPath);
  const realAttachmentPath = fs.realpathSync(attachmentPath);
  if (!stat.isFile() || !isInside(realAttachmentDirectory, realAttachmentPath)) return null;

  return attachmentPath;
};

const processAttachment = async (attachmentDirectory, realAttachmentDirectory, attachment, images) => {
  if (images.has(attachment)) return images.get(attachment);

  const sourcePath = getAttachmentFile(attachmentDirectory, realAttachmentDirectory, attachment);
  if (!sourcePath) return null;

  const format = await getRasterFormat(sourcePath);
  if (!format) return null;

  const newName = HASHED_WEBP.test(attachment)
    ? attachment
    : `${crypto.createHash("sha256").update(attachment).digest("hex").slice(0, 12)}.webp`;
  const newPath = path.join(attachmentDirectory, newName);
  if (fs.existsSync(newPath) && !getAttachmentFile(attachmentDirectory, realAttachmentDirectory, newName)) {
    throw new Error(`Invalid attachment path: ${newPath}`);
  }

  if (newPath !== sourcePath) {
    const existingFormat = fs.existsSync(newPath) ? await getRasterFormat(newPath) : null;
    if (existingFormat === "webp") {
      fs.rmSync(sourcePath);
    } else {
      if (fs.existsSync(newPath)) fs.rmSync(newPath);
      if (format === "webp") {
        fs.renameSync(sourcePath, newPath);
      } else {
        await sharp(sourcePath).webp({ quality: 82 }).toFile(newPath);
        if (!fs.existsSync(newPath)) throw new Error(`Could not create ${newPath}`);
        fs.rmSync(sourcePath);
      }
    }
  }

  const image = { newName, sourcePath: newPath };
  images.set(attachment, image);
  images.set(newName, image);
  return image;
};

const prepareSourceContent = async (content, attachmentDirectory, realAttachmentDirectory, images) =>
  replaceAsync(content, /!\[\[(.*?)\]\]/g, async (full, inner) => {
    const { attachment, alias } = parseEmbed(inner);
    const image = await processAttachment(attachmentDirectory, realAttachmentDirectory, attachment, images);
    if (!image) return full;

    const alt = alias || defaultAlt(attachment);
    return `![[${image.newName}|${alt}]]`;
  });

async function doReplace(full, inner) {
  const { attachment, alias } = parseEmbed(inner);
  const image = this.images.get(attachment);
  if (!image) return full;

  fs.copyFileSync(image.sourcePath, path.join(this.imageDirectory, image.newName));
  return `![${alias || defaultAlt(attachment)}](/images/${image.newName})`;
}

class CustomTransformStream extends Transform {
  constructor({ searchPattern, source, target, options, imageDirectory, images }) {
    super({ ...options, encoding: "utf-8", objectMode: true });
    this.searchPattern = searchPattern;
    this.tail = "";
    this.source = source;
    this.target = target;
    this.imageDirectory = imageDirectory;
    this.images = images;
  }

  _transform(chunk, encoding, cb) {
    const overlap = 64;
    const str = this.tail + chunk;

    replaceAsync(str, this.searchPattern, doReplace.bind(this))
      .then((replaced) => {
        this.tail = replaced.slice(-overlap);
        this.push(replaced.slice(0, -overlap));
        cb();
      })
      .catch(cb);
  }

  _flush(cb) {
    this.push(this.tail);
    cb();
  }
}

class WriteToFile extends Writable {
  constructor(file) {
    super();
    this.file = file;
    this.fd = null;
  }

  _write(chunk, enc, cb) {
    if (chunk.toString() === "") return cb();
    if (!this.fd) this.fd = fs.openSync(this.file, "w");
    fs.writeSync(this.fd, chunk);
    cb();
  }

  _final(cb) {
    if (this.fd) fs.closeSync(this.fd);
    cb();
  }
}

const iterateOverAll = async (source, target, imageDirectory) => {
  assertExists(source);
  assertExists(target);
  assertExists(imageDirectory);

  const attachmentDirectory = path.join(source, IMAGE_ATTACHMENT_PATH);
  const attachmentStats = fs.existsSync(attachmentDirectory) && fs.lstatSync(attachmentDirectory);
  const realAttachmentDirectory = attachmentStats?.isDirectory()
    ? fs.realpathSync(attachmentDirectory)
    : null;
  const files = fs.readdirSync(source);
  const preparedFiles = [];
  const images = new Map();

  for (const file of files) {
    const sourceFile = path.join(source, file);
    if (fs.statSync(sourceFile).isDirectory()) continue;

    let content = fs.readFileSync(sourceFile, "utf-8");
    const isMarkdown = [".md", ".mdx"].includes(path.extname(file).toLowerCase());
    if (isMarkdown) {
      const sourceContent = await prepareSourceContent(
        content,
        attachmentDirectory,
        realAttachmentDirectory,
        images
      );
      if (sourceContent !== content) fs.writeFileSync(sourceFile, sourceContent);
      content = sourceContent;
    }
    if (isMarkdown && !/draft:/.test(content)) {
      content = await addSuggestedTitle(content, file);
    }

    preparedFiles.push({ file, content });
  }

  const tasks = preparedFiles.map(({ file, content }) => {
    const fileStream = Readable.from([content]);
    const writeStream = new WriteToFile(path.join(target, file));

    const transformStream = new CustomTransformStream({
      searchPattern: /!\[\[(.*?)\]\]/g,
      source,
      target,
      imageDirectory,
      images,
    });

    const filterStream = new FilterStream();

    return pipeline(fileStream, filterStream, transformStream, writeStream);
  });

  await Promise.all(tasks);
};

const runGit = (args, options = {}) =>
  execFileSync("git", args, { encoding: "utf-8", stdio: "pipe", ...options });

const getGitRoot = (directory) =>
  runGit(["-C", directory, "rev-parse", "--show-toplevel"]).trim();

const copyDirectory = (from, to) => {
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
};

const createSnapshot = (source, target, imageDirectory) => {
  const snapshotRoot = fs.mkdtempSync(path.join(os.tmpdir(), "publish-snapshot-"));
  const sourceSnapshot = path.join(snapshotRoot, "source");
  const targetSnapshot = path.join(snapshotRoot, "target");
  const imageSnapshot = path.join(snapshotRoot, "images");

  copyDirectory(source, sourceSnapshot);
  copyDirectory(target, targetSnapshot);
  copyDirectory(imageDirectory, imageSnapshot);

  return {
    restore() {
      copyDirectory(sourceSnapshot, source);
      copyDirectory(targetSnapshot, target);
      copyDirectory(imageSnapshot, imageDirectory);
    },
    cleanup() {
      fs.rmSync(snapshotRoot, { recursive: true, force: true });
    },
  };
};

const waitForDecision = () =>
  new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", (key) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();

      if (key.equals(Buffer.from([0x1b]))) return resolve("abort");
      if (key.equals(Buffer.from([0x0d])) || key.equals(Buffer.from([0x0a]))) {
        return resolve("proceed");
      }

      resolve("abort");
    });
  });

const reviewWithPi = (diff) => {
  const prompt = `Review this git diff and write a commit message.

Return exactly this format:

REVIEW:
- concise review points

COMMIT_MESSAGE:
<one-line conventional commit style message>`;

  const result = spawnSync("pi", ["-p", "--no-tools", prompt], {
    input: diff,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || "pi review failed");

  return result.stdout.trim();
};

const getCommitMessage = (piReview) => {
  const match = piReview.match(/COMMIT_MESSAGE:\s*\n?(.+)/i);
  if (!match) throw new Error("Could not find COMMIT_MESSAGE in pi output");
  return match[1].trim().replace(/^['"]|['"]$/g, "");
};

const publishAndCommit = async (sourceDirectory, targetDirectory, imageDirectory) => {
  const source = resolveRelative(sourceDirectory);
  const target = resolveRelative(targetDirectory);
  const images = resolveRelative(imageDirectory);

  assertExists(source);
  assertExists(target);
  assertExists(images);

  const gitRoot = getGitRoot(target);
  const targetPath = path.relative(gitRoot, target);
  const imagesPath = path.relative(gitRoot, images);
  const gitOptions = { cwd: gitRoot };
  const snapshot = createSnapshot(source, target, images);

  try {
    await iterateOverAll(source, target, images);

    const diff = runGit(["diff", "--", targetPath, imagesPath], gitOptions);
    const untracked = runGit(
      ["ls-files", "--others", "--exclude-standard", "--", targetPath, imagesPath],
      gitOptions
    );

    if (!diff.trim() && !untracked.trim()) {
      console.log("No publish changes to commit.");
      return;
    }

    const piReview = reviewWithPi(`${diff}\n\nUntracked files:\n${untracked}`);
    const commitMessage = getCommitMessage(piReview);

    console.log("\nChanged files:");
    console.log(runGit(["status", "--short", "--", targetPath, imagesPath], gitOptions).trim());
    console.log("\nPi review and commit message:\n");
    console.log(piReview);
    console.log("\nPress Enter to git add, commit, and push. Press Esc to stop and undo publish changes.");

    const decision = await waitForDecision();
    if (decision !== "proceed") {
      snapshot.restore();
      console.log("Publish changes undone.");
      return;
    }

    runGit(["add", "--", targetPath, imagesPath], { ...gitOptions, stdio: "inherit" });
    runGit(["commit", "--only", "-m", commitMessage, "--", targetPath, imagesPath], {
      ...gitOptions,
      stdio: "inherit",
    });
    runGit(["push"], { ...gitOptions, stdio: "inherit" });
  } finally {
    snapshot.cleanup();
  }
};

const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error("Usage: node publish.js <sourceDir> <targetDir> <imageDir>");
  process.exit(1);
}

const sourceDirectory = args[0];
const targetDirectory = args[1];
const imageDirectory = args[2];

publishAndCommit(sourceDirectory, targetDirectory, imageDirectory).catch((err) => {
  console.error(`There is an error: ${err.message}`);
  process.exit(1);
});
