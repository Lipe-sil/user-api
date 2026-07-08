import "reflect-metadata";
import express from "express";
import userRouter from "./router/user.router";

const app = express();

app.use(express.json());
app.use(userRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

export default app;