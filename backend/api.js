const express = require('express');
const axios = require('axios');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const router = express.Router();

const csvFilePath = 'users.csv';

const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'id', title: 'ID' },
    { id: 'first_name', title: 'First Name' },
    { id: 'last_name', title: 'Last Name' },
    { id: 'email', title: 'Email' }
  ],
  append: true
});

// Fetch users from API
router.get('/users', async (req, res) => {
    const size = req.query.size || 50; // Default to 10 if size parameter is not provided
  
    try {
      const response = await axios.get(`https://random-data-api.com/api/users/random_user?size=${size}`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  });

// Save users to CSV
router.post('/save', async (req, res) => {
  const users = req.body;
  try {
    await csvWriter.writeRecords(users);
    res.status(200).send('Users saved successfully');
  } catch (error) {
    res.status(500).send('Error saving users');
  }
});

// Fetch users from CSV
router.get('/csv-users', (req, res) => {
  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const rows = data.split('\n').filter(row => row.length > 0);
    const headers = rows.shift().split(',');

    const users = rows.map(row => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index].trim();
        return obj;
      }, {});
    });

    res.json(users);
  });
});

// Edit user in CSV
router.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;

  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const users = data.split('\n').filter(row => row.length > 0).map(row => row.split(',')).map(user => ({
      id: user[0],
      first_name: user[1],
      last_name: user[2],
      email: user[3]
    }));

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };

    const updatedData = users.map(user => `${user.id},${user.first_name},${user.last_name},${user.email}`).join('\n');

    fs.writeFile(csvFilePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json(updatedUser);
    });
  });
});

// Delete user from CSV
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    let users = data.split('\n').filter(row => row.length > 0).map(row => row.split(',')).map(user => ({
      id: user[0],
      first_name: user[1],
      last_name: user[2],
      email: user[3]
    }));

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);

    const updatedData = users.map(user => `${user.id},${user.first_name},${user.last_name},${user.email}`).join('\n');

    fs.writeFile(csvFilePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  });
});

module.exports = router;
