import { Transform } from "stream";
import fs from "fs";
import path from "path";

const [inputDirectory, outputDirectory] = process.argv.slice(2);

const objectToMeta = (obj) => {
  let meta = "+++\n";

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      meta += `${key} = ${value.length > 0 ? `['${value.join("', '")}']` : '[]'}\n`;
    } else {
      meta += `${key} = ${value === true || value === false ? value : `'${value}'`}\n`;
    }
  }

  meta += "+++\n";
  return meta;
};

export class ReplaceTransform extends Transform {
  constructor(options, searchPattern) {
    super({ ...options, encoding: "utf-8", objectMode: true });
    this.pattern = searchPattern;
    this.meta = "";
    this.reachedEndMeta = false;
    this.startedMeta = false;
    this.unchanged = "";
  }

  _transform(chunk, _, cb) {
    // match all that is between --- and ---
    const arrOfText = chunk.split("---");


    // when long meta
    if (arrOfText.length < 3 && !this.reachedEndMeta) {
      const [bef, after] = arrOfText;

      if (arrOfText.length > 1) {
        if (this.startedMeta) {
          this.reachedEndMeta = true;
          this.meta += bef;
          this.unchanged += after;
        } else {
          this.startedMeta = true;
          this.meta += after;
        }
      }
    }

    // short
    // ['', sometext, rest]
    if (arrOfText.length > 2) {
      const [bef, after, rest] = arrOfText;
      this.meta += after;
      this.unchanged += bef + rest;
    }

    cb();
  }

  _flush(cb) {
    // Process the meta data

    const splited = this.meta.split('\n');
    let lastKey = '';
    const obj = splited.reduce((pv, cv) => {
      if (cv === '---') return pv;
      const [key, value] = cv.split(':');
      if (key && typeof value === 'string') {
        lastKey = key;
        pv[key] ??= typeof value === 'string' && value.length > 0 ? value.replaceAll(/"/g, '').trim() : [];
        return pv;
      }
      if (Array.isArray(pv[lastKey])) pv[lastKey].push(key.replace(/-/g, ' ').trim());
      return pv;
    }, {});

    // check description and pubDate should be instead of date
    obj.pubDate ??= obj.date;
    delete obj.date;

    if (!obj.description) obj.description = "";

    if (!obj.draft) obj.draft = false;

    // Convert the object back to meta format
    const newMeta = objectToMeta(obj);

    // Push the final result
    this.push(newMeta + this.unchanged);
    cb();
  }
}

const processDirectory = (input, output) => {
    if (!fs.existsSync(output)) fs.mkdirSync(output, {recursive: true});
    const files = fs.readdirSync(input).filter(file => file.endsWith('.md'));
    for (const file of files) {
      const newTitle = file.split(' ').map(str => str.toLowerCase()).join('-');

        const fileStream = fs.createReadStream(path.join(input, file), { encoding: "utf-8" });
        fileStream.pipe(new ReplaceTransform())
        .pipe(fs.createWriteStream(path.join(output, newTitle), { encoding: "utf-8" }));
    }
}

processDirectory(inputDirectory, outputDirectory);

// fileStream
//   .pipe(new ReplaceTransform({}, /^\s*#+\s*(.+)$/gm, "## $1"))
//   .pipe(fs.createWriteStream(fileTo, { encoding: "utf-8" }));
