// naive-copy.js
import fs from "fs";
import path from "path";

const sourcePath = path.resolve("logo.png");
const destPath = path.resolve("logo-corrupted.png");

console.log(`Reading from: ${sourcePath}`);

try {
  // Let's try the obvious. Read the file into a string.
  // We have to provide an encoding, right? 'utf8' is standard.
  const data = fs.readFileSync(sourcePath, "utf8");

  console.log("File read into a string. Here is a sample:");
  console.log(data.slice(0, 50)); // Let's see what it looks like

  console.log(`\nWriting data back to: ${destPath}`);
  fs.writeFileSync(destPath, data);

  console.log("Copy complete. Or is it?");
} catch (err) {
  console.error("An error occurred:", err);
}
