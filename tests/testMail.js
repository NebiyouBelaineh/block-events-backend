const { configDotenv } = require('dotenv'); 
configDotenv();
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});
//only works for specific emails because of a pricing issue  
mg.messages.create('sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org', {
	from: 'Block Events <mailgun@sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org>',
	to: 'dtindiwensi@gmail.com',
	subject: 'Hello',
	text: 'Testing some Mailgun awesomeness!',
})
.then(msg => console.log(msg)) // logs response data
.catch(err => console.log(err)); // logs any error