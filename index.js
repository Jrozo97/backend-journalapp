const express = require('express');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 4000;

const { dbConnection } = require('./database/config');
require('dotenv').config();

dbConnection();

app.use(cors());

app.use( express.json() );

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));




app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${ port }`)
});