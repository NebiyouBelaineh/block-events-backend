import mg from '../config/emailService';
import User from '../models/user';
import Event from '../models/events';
import Notification from '../models/notification';

class notificationController {
  static async eventInvite(eventId, userId, emails) {
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    emails.forEach(async (email) => {
      const data = {
        from: {
          name: 'Block Events',
          address: 'testblockevents@gmail.com',
        },
        to: `${email}`,
        subject: `Invitation to ${event.title}`,
        text: `Hello,\n ${user.email} would like to invite you to attend ${event.title}\n/
        If you would like more details please follow this link`,
      };
      mg.sendMail(data)
        .then((msg) => console.log(msg))
        .catch((err) => console.log(err));;
    });
  }

  static async eventFeedback(eventId, userId, feedback) {
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
        ${feedback}`,
    };
    mg.sendMail(data)
      .then((msg) => console.log(msg))
      .catch((err) => console.log(err));
  }

  static async eventRegistration(eventId, userId) {
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    const data = {
      from: {
        name: 'Block Events',
        address: 'testblockevents@gmail.com',
      },
      to: `${user.email}`,
      subject: `Registration for ${event.title}`,
      text: `Hello,\n You have successfully registered for ${event.title}`,
    };
    mg.sendMail(data)
      .then((msg) => console.log(msg))
      .catch((err) => console.log(err));
  }

  static async eventCancellation(eventId) {
    const event = await Event.findById(eventId);
    const { attendees } = event;
    attendees.forEach(async (attendee) => {
      const user = await User.findById(attendee);
      const data = {
        from: {
          name: 'Block Events',
          address: 'testblockevents@gmail.com',
        },
        to: `${user.email}`,
        subject: `Event Cancellation for ${event.title}`,
        text: `Hello,\n ${event.title} has been cancelled by ${event.createdBy}\n`,
      };
      mg.sendMail(data)
        .then((msg) => console.log(msg))
        .catch((err) => console.log(err));
    });
  }

  static async eventUpdate(eventId) {
    const event = await Event.findById(eventId);
    const { attendees } = event;
    attendees.forEach(async (attendee) => {
      const user = await User.findById(attendee);
      const data = {
        from: {
          name: 'Block Events',
          address: 'testblockevents@gmail.com',
        },
        to: `${user.email}`,
        subject: `Event Update for ${event.title}`,
        text: `Hello,\n ${event.title} has been updated by ${event.createdBy}\n`,
      };
      mg.sendMail(data)
        .then((msg) => console.log(msg))
        .catch((err) => console.log(err));
    });
  }

  // to be used called after an event is created
  static async setEventReminder(eventId) {
    const event = await Event.findById(eventId);
    const eventDate = event.startDateTime;
    const weekBeforeDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayBeforeDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

    const weekBefore = new Notification({
      eventId,
      timeLeft: 'week',
      dueDate: weekBeforeDate,
    });
    const dayBefore = new Notification({
      eventId,
      timeLeft: 'day',
      dueDate: dayBeforeDate,
    });
    await weekBefore.save();
    await dayBefore.save();
  }

  static async deleteEventReminder(eventId) {
    await Notification.deleteMany({ eventId });
  }

  // will be used in app.js to check for due notifications
  static async sendDueNotifications() {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const dueNotifications = await Notification.find({
      dueDate: {
        $lte: dueDate,
        $gte: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    dueNotifications.forEach(async (notification) => {
      const event = await Event.findById(notification.eventId);
      const { attendees } = event;
      attendees.forEach(async (attendee) => {
        const user = await User.findById(attendee);
        const data = {
          from: {
            name: 'Block Events',
            address: 'testblockevents@gmail.com',
          },
          to: `${user.email}`,
          subject: `Reminder for ${event.title}`,
          text: `Hello,\n ${event.title} is comming up on ${event.date}\n`,
        };
        mg.sendMail(data)
          .then((msg) => console.log(msg))
          .catch((err) => console.log(err));
      });
    });
  }
}

export default notificationController;
