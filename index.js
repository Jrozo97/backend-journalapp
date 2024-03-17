const express = require('express');
const cors = require('cors');

const app = express();

const { dbConnection } = require('./database/config');
require('dotenv').config();

dbConnection();

app.use(cors());

app.use( express.json() );

app.get('/', (req, res) => {
  res.send('Hola mundo!');
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});