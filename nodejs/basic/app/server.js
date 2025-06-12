const express = require("express");

const app = express();

app.use("/mid", (req, res) => {
  res.send("<h1>Hello there from mid</h1>");
});

app.get("/", (req, res) => {
  res.send("<button onclick='window.location.href=\"/mid\"'>Test</button>");
});

app.use("/*slate", (req, res) => {
  res.redirect("/");
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

app.listen(3001, (err) => {
  if (err) {
    console.log('error happended');
  } else {
    console.log("server is running on port 3001");
  }
});
