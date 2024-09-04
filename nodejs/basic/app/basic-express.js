const express = require("express");

const app = express();

app.use("/mid", (req, res) => {
  res.send("<h1>Hello there from mid</h1>");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello there</h1>");
});

app.listen(3001, () => console.log("server is running on port 3001"));
