const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoMemoryServer;

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri || mongoUri.includes("your_mongodb_connection_string")) {
            throw new Error("MONGO_URI is missing or still a placeholder");
        }

        await mongoose.connect(mongoUri, {
            dbName: process.env.DB_NAME || "ai_saas",
        });

        console.log("MongoDB Connected");
    } catch (error) {
        if (process.env.NODE_ENV === "production") {
            console.error("MongoDB connection failed in production; refusing to use ephemeral storage.");
            throw new Error("Production MongoDB connection failed.", { cause: error });
        }

        console.log(`MongoDB connection failed: ${error.message}`);
        console.log("Falling back to an in-memory MongoDB instance for development...");

        mongoMemoryServer = await MongoMemoryServer.create();
        const uri = mongoMemoryServer.getUri();

        await mongoose.connect(uri, {
            dbName: process.env.DB_NAME || "ai_saas_dev",
        });

        console.log("MongoDB Connected");
    }
};

const closeDB = async () => {
    await mongoose.connection.close();

    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
        mongoMemoryServer = undefined;
        console.log("In-memory MongoDB server stopped.");
    }
};

module.exports = { connectDB, closeDB };