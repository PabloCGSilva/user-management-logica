const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Atualize este caminho para o local correto do seu arquivo CSV
const csvFilePath = path.join(__dirname, 'users.csv');

// Função auxiliar para garantir que o arquivo CSV existe
const ensureCSVFileExists = (callback) => {
  fs.access(csvFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Arquivo não existe, vamos criá-lo
      fs.writeFile(csvFilePath, '', 'utf8', (err) => {
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    } else {
      callback(null);
    }
  });
};

// Função auxiliar para ler usuários do CSV
const readUsersFromCSV = (callback) => {
  ensureCSVFileExists((err) => {
    if (err) {
      return callback(err, null);
    }

    fs.readFile(csvFilePath, 'utf8', (err, data) => {
      if (err) {
        return callback(err, null);
      }

      const users = data.split('\n').filter(row => row.length > 0).map(row => row.split(',')).map(user => ({
        id: user[0],
        first_name: user[1],
        last_name: user[2],
        email: user[3]
      }));

      callback(null, users);
    });
  });
};

// Função auxiliar para escrever usuários no CSV
const writeUsersToCSV = (users, callback) => {
  const updatedData = users.map(user => `${user.id},${user.first_name},${user.last_name},${user.email}`).join('\n');
  fs.writeFile(csvFilePath, updatedData, 'utf8', (err) => {
    if (err) {
      return callback(err);
    }

    callback(null);
  });
};

// Rota para obter todos os usuários
router.get('/users', (req, res) => {
  readUsersFromCSV((err, users) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(users);
  });
});

// Rota para salvar um usuário no CSV
// Rota para salvar um novo usuário no CSV
router.post('/save', (req, res) => {
  const newUser = {
    id: req.body.id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email
  };

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

    users.push(newUser);

    const updatedData = users.map(user => `${user.id},${user.first_name},${user.last_name},${user.email}`).join('\n');

    fs.writeFile(csvFilePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'User saved successfully' });
    });
  });
});


// Rota para editar um usuário salvo no CSV
router.put('/users/:id', (req, res) => {
  const userId = req.params.id;

  readUsersFromCSV((err, users) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = {
      id: userId,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    };

    writeUsersToCSV(users, (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'User updated successfully' });
    });
  });
});

// Rota para deletar um usuário salvo no CSV
router.delete('/users/:id', (req, res) => {
  const userId = req.params.id;

  readUsersFromCSV((err, users) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);

    writeUsersToCSV(users, (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  });
});

module.exports = router;
