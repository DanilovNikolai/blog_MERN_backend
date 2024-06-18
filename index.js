import express from 'express';
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

// data base connection
mongoose
  .connect(
    `mongodb+srv://Danilov:${process.env.DB_PASSWORD}@test-cluster.9rnehkm.mongodb.net/blog?retryWrites=true&w=majority&appName=Test-cluster`
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

// middleware (for reading req.body)
app.use(express.json());

// Getting data of user
app.get('/auth/me', checkAuth, UserController.getMe);
// Auth / login
app.post('/auth/login', loginValidation, UserController.login);
// Registration
app.post('/auth/register', registerValidation, UserController.register);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
// Post creation
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
// app.delete('/posts/:id', PostController.remove);
// app.patch('/posts', PostController.update);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${PORT}`);
});
