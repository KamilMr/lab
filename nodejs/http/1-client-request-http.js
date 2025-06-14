const http = require("node:http");

// just use process to get input
const [arg1, arg2 = "GET"] = process.argv.slice(2);
const req = http.request(arg1, { method: arg2 });

// when we get response the cb is issued
req.on("response", (res) => {
  // print bunch of stuff
  console.log(res.headers);
  console.log(res.statusCode);
  //set the encoding
  res.setEncoding("utf-8");
  res.on("data", (data) => console.log("Data from server: " + data));
});

req.end();
let x = req.getHeaders();
console.log(x);
