require('dotenv').config();
const express = require('express');
const app = express();

const port = 3000;

app.get('/', (req, res) => {
  res.send('AutoCare API is running...');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});