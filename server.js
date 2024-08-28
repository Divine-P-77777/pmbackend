const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto'); // For encryption and decryption

dotenv.config();

// Connect to MongoDB
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
client.connect();

// App & Database
const dbName = 'passop';
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Encryption & Decryption Functions
const secretKey = process.env.SECRET_KEY; // Access the secret key from environment variables

const encryptPassword = (password) => {
  return crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.alloc(16, 0)).update(password, 'utf8', 'hex') + crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.alloc(16, 0)).final('hex');
};

const decryptPassword = (encryptedPassword) => {
  return crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.alloc(16, 0)).update(encryptedPassword, 'hex', 'utf8') + crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.alloc(16, 0)).final('utf8');
};

// Get all the passwords
app.get('/', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.find({}).toArray();
  // Decrypt passwords before sending
  const decryptedPasswords = findResult.map(item => ({
    ...item,
    password: decryptPassword(item.password)
  }));
  res.json(decryptedPasswords);
});

// Save a password
app.post('/', async (req, res) => {
  const { password, ...rest } = req.body;
  const encryptedPassword = encryptPassword(password);
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.insertOne({ ...rest, password: encryptedPassword });
  res.send({ success: true, result: findResult });
});

// Delete a password by id
app.delete('/', async (req, res) => {
  const { id } = req.body;
  const db = client.db(dbName);
  const collection = db.collection('passwords');
  const findResult = await collection.deleteOne({ id });
  res.send({ success: true, result: findResult });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
