const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./api');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve the frontend files
app.use(express.static(path.join(__dirname, '../frontend/user-management-frontend/src')));

// Handle requests for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/user-management-frontend/src', 'App.js'));
});

app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
