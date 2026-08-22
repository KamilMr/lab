const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { Readable, Transform, Writable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
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

function doReplace(full, inner) {
  const imagePath = path.join(this.source, IMAGE_ATTACHMENT_PATH, inner);
  if (!fs.existsSync(resolveRelative(imagePath))) return full;

  const { ext, name } = path.parse(inner);
  const safe = name.toLowerCase().replace(/[\s.]/g, "-");
  const newName = safe + ext;
  fs.copyFileSync(
    resolveRelative(imagePath),
    path.join(this.imageDirectory, newName)
  );
  return `![${safe}](/images/${newName})`;
}

class CustomTransformStream extends Transform {
  constructor({ searchPattern, source, target, options, imageDirectory }) {
    super({ ...options, encoding: "utf-8", objectMode: true });
    this.searchPattern = searchPattern;
    this.tail = "";
    this.source = source;
    this.target = target;
    this.imageDirectory = imageDirectory;
  }

  _transform(chunk, encoding, cb) {
    const overlap = 64;
    const str = this.tail + chunk;
    const replaced = str.replace(this.searchPattern, doReplace.bind(this));
    this.tail = replaced.slice(-overlap);
    this.push(replaced.slice(0, -overlap));
    cb();
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

  const files = fs.readdirSync(source);
  const preparedFiles = [];

  for (const file of files) {
    const sourceFile = path.join(source, file);
    if (fs.statSync(sourceFile).isDirectory()) continue;

    let content = fs.readFileSync(sourceFile, "utf-8");
    const isMarkdown = [".md", ".mdx"].includes(path.extname(file).toLowerCase());
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

const createSnapshot = (target, imageDirectory) => {
  const snapshotRoot = fs.mkdtempSync(path.join(os.tmpdir(), "publish-snapshot-"));
  const targetSnapshot = path.join(snapshotRoot, "target");
  const imageSnapshot = path.join(snapshotRoot, "images");

  copyDirectory(target, targetSnapshot);
  copyDirectory(imageDirectory, imageSnapshot);

  return {
    restore() {
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
  const snapshot = createSnapshot(target, images);

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
