const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

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
        console.log(`MongoDB connection failed: ${error.message}`);
        console.log("Falling back to an in-memory MongoDB instance for development...");

        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        await mongoose.connect(uri, {
            dbName: process.env.DB_NAME || "ai_saas_dev",
        });

        console.log("MongoDB Connected");
    }
};

module.exports = connectDB;