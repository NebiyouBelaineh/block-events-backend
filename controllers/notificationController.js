import mg from '../config/emailService.js';
import User from '../models/user.js';
import Event from '../models/events.js';
import Notification from '../models/notification.js';

class notificationController {

   static async eventInvite(req, res) {
    const { eventId, userId, email } = req.body;
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    const data = {
      from: {
        name: 'Block Events',
        address: 'testblockevents@gmail.com',
      },
      to: `${email}`,
      subject: `Invitation to ${event.title}`,
      text: `Hello,\n ${user.email} would like to invite you to attend ${event.title}\n/
      If you would like more details please follow this link`
    }
    mg.sendMail(data)
    .then(msg => console.log(msg)) 
    .catch(err => console.log(err));
  }

  static async eventFeedback(req, res) {
    const { eventId, userId, feedback} = req.body;
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    const eventAuthor = await User.findById(event.createdBy);
    const data = {
      from: {
        name: 'Block Events',
        address: 'testblockevents@gmail.com',
      },
      to: `${eventAuthor.email}`,
        subject: `Feedback for ${event.title}`,
        text: `Hello,\n ${user.email} would like to give you feedback on ${event.title}\n/
        ${feedback}`
      }
    mg.sendMail(data)
    .then(msg => console.log(msg)) 
    .catch(err => console.log(err));
  }

//to be used called after an event is created
  static async setEventReminder(eventId) {
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
  }


//will be used in app.js to check for due notifications
  static async sendDueNotifications() {
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
      const attendees = event.attendees;
      attendees.forEach(async attendee => {
        const user = await User.findById(attendee);
        const data = {
          from: {
            name: 'Block Events',
            address: 'testblockevents@gmail.com',
          },
          to: `${user.email}`,
          subject: `Reminder for ${event.title}`,
          text: `Hello,\n ${event.title} is due on ${event.date}\n/`
        }
        mg.sendMail(data)
        .then(msg => console.log(msg)) 
        .catch(err => console.log(err));
      });
    });
  }
}

export default notificationController;
