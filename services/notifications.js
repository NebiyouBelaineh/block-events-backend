import mg from '../config/emailService.js';
import User from '../models/user.js';
import Event from '../models/events.js';
import Notification from '../models/notification.js';

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

//to be used called after an event is created
export const setEventReminder = async(eventId) => {
  const event = await Event.findById(eventId);
  const eventDate = event.date;
  const weekBeforeDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dayBeforeDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

  const weekBefore = new Notification({
    eventId: eventId,
    timeLeft: 'week',
    dueDate: weekBeforeDate
  });
  const dayBefore = new Notification({
    eventId: eventId,
    timeLeft: 'day',
    dueDate: dayBeforeDate
  });
  await weekBefore.save();
  await dayBefore.save();
};


//will be used in app.js to check for due notifications
export const sendDueNotifications = async() => {
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dueNotifications = await Notification.find({
    dueDate: {
      $lte: dueDate,
      $gte: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)
    }
  });

  dueNotifications.forEach(async notification => {
    const event = await Event.findById(notification.eventId);
    //const attendees = event.attendees;
    //attendees.forEach(async attendee => {
    //  const user = await User.findById(attendee);
    const data = {
      from: 'Block Events <mailgun@sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org>',
      to: 'dtindiwensi@gmail.com',
      subject: `Reminder for ${event.title}`,
      text: `Hello,\n ${event.title} is due on ${event.date}\n/`
    }
    mg.messages.create('sandboxcc6abd444c3c47e3b0a57a7051ce7ead.mailgun.org', data)
    .then(msg => console.log(msg)) 
    .catch(err => console.log(err));
  });
}
