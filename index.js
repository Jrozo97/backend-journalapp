const express = require('express');
const cors = require('cors');

const app = express();

const { dbConnection } = require('./database/config');
require('dotenv').config();

dbConnection();

app.use(cors());

app.use( express.json() );

// routes
app.use('/api/auth', require('./routes/auth'));


app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${ process.env.PORT }`)
});