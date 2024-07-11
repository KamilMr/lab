import {EventEmitter} from 'events'
import {readFile} from 'fs'

/**
 * @example
const sR = new SearchRegex(/regex/)
  sR
  .addFile('file1.txt')
  .addFile('file2.json')
  .find()
  .on('found', (file, match) => console.log(`Regex matched "${match}" in file ${file}`))
  .on('error', err => console.error(`Error ${err.message}`))
  .on('find', (files) => console.log('Searching in files: ', files))
  */
class SearchRegex extends EventEmitter {
  constructor(regex) {
    super()
    this.regex = regex
    this.files = []
  }

  addFile(file) {
    this.files.push(file)
    return this
  }

  find() {
    process.nextTick(() => this.emit('find-start', this.files))
    for (const file of this.files) {
      readFile(file, 'utf8', (err, content) => {
        if (err) {
          return this.emit('error', err)
        }

        const match = content.match(this.regex)
        if (match) {
          match.forEach(elem => this.emit('found', file, elem))
        }
      })
    }
    return this
  }
};

export {SearchRegex};
