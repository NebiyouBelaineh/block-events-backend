import { now } from 'mongoose';
import dbClient from './config/db';
// import User from './models/user';
import Event from './models/events';
import { ObjectId } from 'mongodb';
// import { Excep}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Send a ping to confirm a successful connection
    dbClient.connect()
    try {
      const newUser = new Event({
        title: 'test1',
        description: 'test1',
        date: new Date(now()),
        location: {
          address: 'test1',
          city: 'test1',
          state: 'test1',
          zip_code: 'test1'
        },
        createdBy: '66b6029c3bf22b2f4d49b349',
        // attendees: ['test1'],
        tags: ['test1'],
      });
      await newUser.save().then(user => {
        console.log('User created:', user);
      }).catch(err => {
        if (err.code === 11000) {
          console.error('Duplicate key error');
        } else {
          console.error('Other error:', err.message);
        }
      });

      Event.find().then(users => {
        console.log(users);
      }).catch(err => {
        console.log(err.message);
      })

    } finally {
      // Ensures that the client will close when you finish/error
      // await dbClient.close();
    }
  } catch (e) {
    console.error(e);
  }
}
run().catch(console.dir);
