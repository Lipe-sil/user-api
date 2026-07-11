import "reflect-metadata";
import express from "express";
import userRouter from "./router/user.router";
import { errorMiddleware } from "./middleware/errors.middleware";

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
