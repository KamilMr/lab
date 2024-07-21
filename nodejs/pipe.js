/*
On a Linux device, try using the "cat" command to display the contents of a file and then pipe it to this location. You will see the output printed to the console.
 * */ 
let data;
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  data += chunk;
});

process.stdin.on("end", () => {
  console.log("data: " + data);
});
