const mongoose = require('mongoose');

const URI = process.env.DB;
mongoose.connect(URI)
  .then(() => console.log('Mongo connected'))
  .catch(err => {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  });
