import dbClient from './config/db';
import User from './models/user';
// import Event from './models/events';
// import { Excep}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Send a ping to confirm a successful connection
    dbClient.connect()
    try {
      const newUser = new User({
        username: 'test1',
        profile: {
          firstName: 'test1',
          lastName: 'test1',
          bio: 'test1',
          avatar: 'test1'
        },
        email: 'test1',
        password: 'test1',
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

      User.find().then(users => {
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
