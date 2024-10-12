import express from 'express';
// multer
import multer from 'multer';
// cors
import cors from 'cors';
import 'dotenv/config';
// для работы с MongoDB
import mongoose from 'mongoose';
// validations
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  commentCreateValidation,
} from './validations.js';
// utils
import { checkAuth, handleValidationErrors } from './utils/index.js';
// controllers
import {
  UserController,
  PostController,
  CommentController,
} from './controllers/index.js';
// aws-sdk
import AWS from 'aws-sdk';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Настройки для Yandex Object Storage
const s3 = new AWS.S3({
  endpoint: 'https://storage.yandexcloud.net', // Обязательно укажите этот endpoint для Яндекс
  accessKeyId: process.env.YANDEX_ACCESS_KEY, // Ваш access key
  secretAccessKey: process.env.YANDEX_SECRET_KEY, // Ваш secret key
  region: 'ru-central1', // Регион Яндекса
  s3ForcePathStyle: true, // Принудительное использование пути для бакета
});

// Функция загрузки файла
const uploadImage = (file) => {
  const params = {
    Bucket: 'danilov-bucket-1', // Имя бакета
    Key: file.originalname, // Имя файла в хранилище
    Body: file.buffer, // Данные файла
    ContentType: file.mimetype, // Тип содержимого
    ACL: 'public-read', // Делаем файл публичным
  };

  // Отправка файла в Yandex Object Storage
  return s3.upload(params).promise();
};

// data base connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

// middleware (for reading req.body)
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// routes
app.get('/auth/me', checkAuth, UserController.getMe);
app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getPopular);
app.get('/tags/:tag', PostController.getPostsByTags);
app.get('/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.get('/comments', CommentController.getAll);

app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);

app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);

app.post('/upload', checkAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  try {
    // Загрузка изображения в Yandex Object Storage
    await uploadImage(req.file);

    // Возвращаем публичный URL файла
    const imageUrl = `https://storage.yandexcloud.net/danilov-bucket-1/${req.file.originalname}`;
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки', error });
  }
});

app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);

app.post(
  '/comments',
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  CommentController.create
);

app.delete('/posts/:id', checkAuth, PostController.remove);

app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.patch('/users/:id', checkAuth, UserController.update);

// server launch
app.listen(process.env.PORT || 4444, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${process.env.PORT}`);
});
