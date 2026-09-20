const express = require('express');
const app = express();
<<<<<<< HEAD

const port = 3000;

app.get('/', (req, res) => {
  res.send('AutoCare Server');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
=======
const port = 3000;

app.get('/', (req, res) => {
  res.send('bababba');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
>>>>>>> 7cd3aa412be1e248915460939da5db11e08f422b
});