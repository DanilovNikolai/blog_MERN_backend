import express from 'express';
import 'dotenv/config';
// для работы с MongoDB
import mongoose from 'mongoose';
// json web tokens
import jwt from 'jsonwebtoken';
// validations
import { registerValidation } from './validations/auth.js';
import { validationResult } from 'express-validator';

import UserModel from './models/User.js';

const PORT = process.env.PORT;
const app = express();

// data base connection
mongoose
  .connect(
    `mongodb+srv://Danilov:${process.env.DB_PASSWORD}@test-cluster.9rnehkm.mongodb.net/?retryWrites=true&w=majority&appName=Test-cluster`
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

// middleware (for reading req.body)
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('Main Page');
});

app.post('/auth/register', registerValidation, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  // документ на создание пользователя
  const doc = new UserModel({
    email: req.body.email,
    fullname: req.body.fullname,
    passwordHash: req.body.passwordHash,
    avatarUrl: req.body.avatarUrl,
  });

  res.json({
    success: true,
  });
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${PORT}`);
});
