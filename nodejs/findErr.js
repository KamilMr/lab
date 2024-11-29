/*
 * Use this function by piping data from cat command:
 * cat file.js | node findErr.js
 * */
const set = new Set();
process.stdin.on('data', data => {
  const strings = data.toString();

  const regex = /next\(\s*['"]([^'"]*)['"]\s*\)/g;

  const match = strings.match(regex);
  set.has(match) ? null : set.add(match);
});

process.stdin.on('end', () => {
  const [arr] = Array.from(set);
  const data = arr.map(err => {
    const [, txt] = err.split("'");
    return txt;
  });

  console.log(Array.from(new Set([...data])).sort());
});
