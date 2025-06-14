const https = require("node:https");

// just use process to get input
const [arg1, arg2 = "GET"] = process.argv.slice(2);
// rejectUnauthorized is false because we are using a self-signed certificate
const req = https.request(arg1, {method: arg2, rejectUnauthorized: false});

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
