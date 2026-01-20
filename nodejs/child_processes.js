// [Author](https://www.thenodebook.com/node-arch/node-process-lifecycle#child_process-and-the-orphan-problem)
// Being a responsible parent process
const { spawn } = require("child_process");
const children = [];

const child = spawn("node", ["cool-lil-script.js"]);
children.push(child);

process.on("SIGTERM", () => {
  console.log("Parent got SIGTERM. Telling children to shut down...");
  children.forEach((child) => {
    child.kill("SIGTERM"); // Pass the signal on
  });

  // Let's just wait for all children to exit before the parent exits
  Promise.all(children.map((c) => new Promise((resolve) => c.on("close", resolve)))).then(() => {
    console.log("All children are gone. Parent exiting.");
    process.exit(0);
  });
});
