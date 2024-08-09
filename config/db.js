import mongoose from 'mongoose';

const { configDotenv } = require('dotenv'); 
configDotenv();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;

const uri = `mongodb+srv://${username}:${password}${cluster}`;

class DbClient {
    constructor() {
        this.db = this.connect();
    }
    async connect() {
        this.db = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).catch(error => console.log(error));
        console.log("Connected to database");
        return this.db;
    }

    async close() {
        return await this.db.disconnect();
    }
}
const dbClient = new DbClient();
export default dbClient;
