require('dotenv').config();
require('./src/db');            // ← Mongo connection
const app  = require('./src');  // ← Express app factory
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
