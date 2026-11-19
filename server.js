const express = require('express');
const cors = require('cors');
const path = require('path');
const { handlePlateRequest } = require('./api/placa-core');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'docs')));
app.get('/api/placa/:placa', (req, res) => handlePlateRequest(req, res));

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Consulta Veicular em http://localhost:${port}`));
}

module.exports = app;
