import app from "./app";
import { connectDatabase } from "./database/database";

const PORT = process.env.PORT || 8000;

async function start() {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

start();