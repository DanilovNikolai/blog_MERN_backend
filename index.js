import express from 'express';
import 'dotenv/config';
// для работы с MongoDB
import mongoose from 'mongoose';
// json web tokens
import jwt from 'jsonwebtoken';
// for passwords encryption
import bcrypt from 'bcrypt';
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

app.post('/auth/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const password = req.body.password;
  // алгоритм шифрования пароля
  const salt = await bcrypt.genSalt(10);
  // сохраняем зашифрованный пароль в переменной
  const passwordHash = await bcrypt.hash(password, salt);

  // документ на создание пользователя
  const doc = new UserModel({
    email: req.body.email,
    fullname: req.body.fullname,
    passwordHash: passwordHash,
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
