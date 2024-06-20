const express = require("express");

const app = express();

app.use("/mid", (req, res) => {
  res.send("<h1>Hello there from midd</h1>");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello there</h1>");
});

app.listen(4423);
