import express from 'express';
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

const upload = multer({ storage });

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

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.originalname}` });
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
