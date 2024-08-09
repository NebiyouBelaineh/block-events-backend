import Event from '../models/events';

class EventController {
  // Current End Points are only for testing
  // DB connection will be handled with next steps
  static async createEvent(req, res) {
    res.send('Event created');
  }

  static async getEvent(req, res) {
    const { id } = req.params;
    if (id) {
      res.send(`Event with ID: ${id} requested`);
    }
    res.send('All events requested');
  }

  static async updateEvent(req, res) {
    const { id } = req.params;
    const { name, date } = req.query;
    res.send(`Event with id: ${id} updated: date :${date} name: ${name}`);
  }

  static async deleteEvent(req, res) {
    const { id } = req.params;
    res.send(`Event with id: ${id} deleted`);
  }
}

export default EventController;
