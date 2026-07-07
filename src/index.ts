import "reflect-metadata";
import express from "express";
import { connectDatabase } from "./database/database";
import userRouter from "./router/user.router";

const app = express();

app.use(express.json());
app.use(userRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

const PORT = process.env.PORT

async function start() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

start();