import mg from '../config/emailService.js';

//only works for specific emails because of a pricing issue  
mg.sendMail({
	from: {
    name: 'Block Events',
    address: 'testblockevents@gmail.com'
  },
	to: 'dtindiwensi@gmail.com, dasiimwe0@gmail.com',
	subject: 'Hello',
	text: 'Testing some nodemailer awesomeness!',
})
.then(msg => console.log(msg)) // logs response data
.catch(err => console.log(err)); // logs any error