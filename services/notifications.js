import mg from '../config/emailService.js';
import User from '../models/user.js';
import Event from '../models/events.js';

export const eventInvite = async(req, res) => {
  const { eventId, userId, email } = req.body;
  const event = await Event.findById(eventId);
  const user = await User.findById(userId);
  const data = {
    from: 'Block Events <mailgun@sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org>',
    to: 'dtindiwensi@gmail.com',
    subject: `Invitation to ${event.title}`,
    text: `Hello,\n ${user.email} would like to invite you to attend ${event.title}\n/
    If you would like more details please follow this link`
  }
  mg.messages.create('sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org', data)
  .then(msg => console.log(msg)) 
  .catch(err => console.log(err));
};

export const eventFeedback = async(req, res) => {
  const { eventId, userId, feedback} = req.body;
  const event = await Event.findById(eventId);
  const user = await User.findById(userId);
  const data = {
    from: 'Block Events <mailgun@sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org>',
    to: 'dtindiwensi@gmail.com',
    subject: `Feedback for ${event.title}`,
    text: `Hello,\n ${user.email} would like to give you feedback on ${event.title}\n/
    ${feedback}`
  }
  mg.messages.create('sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org', data)
  .then(msg => console.log(msg)) 
  .catch(err => console.log(err));
};
