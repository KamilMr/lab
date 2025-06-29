const fs = require("node:fs");
const path = require("node:path");
const { Transform, Writable } = require("node:stream");
const { pipeline } = require("node:stream");
const FilterStream = require("./filter-draft");

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

class WrtieToFile extends Writable {
  constructor(file) {
    super(file);
    this.file = file;
    this.fd = null;
  }

  _write(chunk, enc, cb) {
    if (chunk.toString() === '') return cb();
    if (!this.fd) this.fd = fs.openSync(this.file, 'w');
    fs.writeSync(this.fd, chunk);
    cb();
  }
}

const iterateOverAll = (source, target, imageDirectory) => {
  assertExists(source);
  assertExists(target);
  assertExists(imageDirectory);

  const files = fs.readdirSync(source);

  for (const file of files) {
    if (fs.statSync(path.join(source, file)).isDirectory()) continue;
    const fileStream = fs.createReadStream(path.join(source, file), {
      encoding: "utf-8",
    });
    const writeStream = new WrtieToFile(path.join(target, file));

    const transformStream = new CustomTransformStream({
      searchPattern: /!\[\[(.*?)\]\]/g,
      source,
      target,
      imageDirectory,
    });

    const filterStream = new FilterStream();

    pipeline(fileStream, filterStream, transformStream, writeStream, (err) => {
      if (err) {
        console.error(`There is an error: ${err}`);
        process.exit(1);
      }
    });
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

iterateOverAll(sourceDirectory, targetDirectory, imageDirectory);
