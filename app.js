import express from 'express';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
import run from './config/testConnection.js';
import { sendDueNotifications } from './services/notifications.js';
configDotenv();

const port = process.env.PORT || 3300;
const app = express();
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  await sendDueNotifications();
});

run().then(expressApp()).catch(console.dir);
function expressApp() {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);    
    });    
}
