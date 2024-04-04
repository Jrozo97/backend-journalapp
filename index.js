const express = require('express');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 4000;

const { dbConnection } = require('./database/config');
require('dotenv').config();

dbConnection();

app.use(cors());

app.use( express.json() );
// Configurar el directorio público para servir archivos estáticos
app.use(express.static('public'));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Ruta para mostrar la descripción del proyecto y las rutas disponibles
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/welcome.html');
});


app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${ port }`)
});