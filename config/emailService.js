// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');
require('dotenv').config();

const mg = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export default mg;
