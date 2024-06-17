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
    `mongodb+srv://Danilov:${process.env.DB_PASSWORD}@test-cluster.9rnehkm.mongodb.net/blog?retryWrites=true&w=majority&appName=Test-cluster`
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

// middleware (for reading req.body)
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('Main Page');
});

// авторизация
app.post('./auth/login', async (req, res) => {
  try {
    // ищем пользователя в БД по email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return req.status(404).json({
        message: 'Invalid login or password',
      });
    }

    // сравниваем пароль из БД и тот, что ввёл клиент
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPassword) {
      return req.status(404).json({
        message: 'Invalid login or password',
      });
    }

    // Если пользователь нашелся и пароль валидный, то выполняется код ниже
    // Генерируем токен
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret',
      {
        expiresIn: '30d',
      }
    );

    // Убираем захэшированный пароль из информации о пользователе
    const { passwordHash, ...userData } = user._doc;

    // Возвращаем ответ клиенту
    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Login was failed',
    });
  }
});

// регистрация
app.post('/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    // алгоритм шифрования пароля
    const salt = await bcrypt.genSalt(10);
    // сохраняем зашифрованный пароль в переменной
    const hash = await bcrypt.hash(password, salt);

    // документ на создание пользователя
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    });

    // сохраняем нового пользователя в mongoDB
    const user = await doc.save();

    // шифруем id
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Registration was failed',
    });
  }
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${PORT}`);
});
