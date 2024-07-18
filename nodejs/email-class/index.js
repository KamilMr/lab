import "dotenv/config";
import express from "express";

import devRoutes from "./routes/dev.js";
import verRoutes from "./routes/ver.js";

const app = express();

app.use(express.json());

/*Here are the routes, remember that structure of middleware matters.*/
app.use("/dev", devRoutes); // TODO add validation ENV === dev
app.use("/ver", verRoutes);

/*This is only for reading purpose*/
app.get("/main", (req, res) => {
  res.send("<h1>Hello </h1>");
});

/*
The last middleware catches errors passed by the next function. It is important to note that if there are any other middlewares, such as in devRoutes or verRoutes, that use next(new Error), the error will also be caught here.
*/
app.use((err, req, res, next) => {
  res.send(err);
});

app.listen(process.env.PORT, () =>
  console.log("server is running on port ", process.env.PORT),
);

