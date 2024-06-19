import express from 'express';
import multer from 'multer';
import 'dotenv/config';
// для работы с MongoDB
import mongoose from 'mongoose';
// validations
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations.js';

import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';

const PORT = process.env.PORT;
const app = express();

// Создаем хранилище для загруженных картинок
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

// data base connection
mongoose
  .connect(
    `mongodb+srv://Danilov:${process.env.DB_PASSWORD}@test-cluster.9rnehkm.mongodb.net/blog?retryWrites=true&w=majority&appName=Test-cluster`
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

// middleware (for reading req.body)
app.use(express.json());

app.post('/auth/login', loginValidation, UserController.login);
app.post('/auth/register', registerValidation, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, PostController.update);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${PORT}`);
});
