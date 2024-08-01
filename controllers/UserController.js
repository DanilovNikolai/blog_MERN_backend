// json web tokens
import jwt from 'jsonwebtoken';
// for passwords encryption
import bcrypt from 'bcrypt';
// models
import UserModel from '../models/User.js';

export const register = async (req, res) => {
  try {
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
};

export const login = async (req, res) => {
  try {
    // ищем пользователя в БД по email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Invalid login or password',
      });
    }

    // сравниваем пароль из БД и тот, что ввёл клиент
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPassword) {
      return res.status(404).json({
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
};

export const getMe = async (req, res) => {
  try {
    // Ищем пользователя по расшифрованному id
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User is not found' });
    }

    // Убираем захэшированный пароль из информации о пользователе
    const { passwordHash, ...userData } = user._doc;

    // Возвращаем ответ клиенту
    res.json({ ...userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Not available' });
  }
};

export const update = async (req, res) => {
  try {
    const userId = req.params.id;

    const updateData = {};
    if (req.body.avatarUrl) updateData.avatarUrl = req.body.avatarUrl;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.fullName) updateData.fullName = req.body.fullName;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { passwordHash, ...userData } = updatedUser._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось обновить пользователя' });
  }
};
