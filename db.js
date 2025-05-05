const mongoose = require('mongoose');

mongoose.Promise = global.Promise;                    // explicit but optional

const DB_URI = process.env.DB;

function connect() {
  if (mongoose.connection.readyState >= 1) {
    
    return mongoose.connection.asPromise();
  }

  return mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('[Mongo] Connected:', DB_URI))
  .catch(err => {
    console.error('[Mongo] Connection error:', err.message);
    process.exit(1);                                   // fail fast if bad URI
  });
}

module.exports = { mongoose, connect };
