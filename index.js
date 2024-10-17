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
// aws-sdk (v3)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Настройки для Yandex Object Storage
const s3Client = new S3Client({
  endpoint: 'https://storage.yandexcloud.net',
  region: 'ru-central1',
  credentials: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY,
    secretAccessKey: process.env.YANDEX_SECRET_KEY,
  },
});

// Функция загрузки файла
const uploadImage = async (file) => {
  const params = {
    Bucket: 'danilov-bucket-1',
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  // Отправка файла в Yandex Object Storage
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command); // Загружаем файл
    const imageUrl = `https://storage.yandexcloud.net/danilov-bucket-1/${file.originalname}`; // Формируем URL
    return { Location: imageUrl }; // Возвращаем объект с Location
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    throw error;
  }
};

// data base connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection: success'))
  .catch((err) => console.log('MongoDB connection: failed', err));

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
    const result = await uploadImage(req.file); // Загружаем файл в Yandex Cloud

    res.json({ url: result.Location });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({ message: 'Ошибка загрузки файла' });
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

app.delete('/comments/:id', checkAuth, CommentController.remove);

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
