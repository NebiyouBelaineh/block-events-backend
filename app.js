import express from 'express';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
import run from './config/testConnection.js';
configDotenv();

const port = process.env.PORT || 3300;
const app = express();

run().then(expressApp()).catch(console.dir);
function expressApp() {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);    
    });    
}
