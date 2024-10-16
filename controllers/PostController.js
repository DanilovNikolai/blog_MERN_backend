import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
  try {
    // Сохраняем в переменную все статьи из БД и связываем эту таблицу с таблицей 'user'
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: ['fullName', 'avatarUrl'] }) // связываемся с таблицей 'user' и оставляем поля 'fullName' и 'avatarUrl'
      .exec(); // исполняем

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

// Контроллер для получения постов по тегу
export const getPostsByTags = async (req, res) => {
  try {
    // Получаем название тега из параметров URL
    const { tag } = req.params;

    // Находим все посты, содержащие указанный тег
    const posts = await PostModel.find({ tags: tag })
      .sort({ createdAt: -1 }) // Сортируем по дате создания в порядке убывания
      .populate({ path: 'user', select: ['fullName', 'avatarUrl'] }) // Связываем с таблицей 'user', выбираем только 'fullName' и 'avatarUrl'
      .exec(); // Исполняем запрос

    // Отправляем найденные посты на клиент
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

export const getPopular = async (req, res) => {
  try {
    // Сортируем по количеству просмотров
    const posts = await PostModel.find()
      .sort({ viewsCount: -1 })
      .populate({ path: 'user', select: ['fullName', 'avatarUrl'] }) // связываемся с таблицей 'user' и оставляем поля 'fullName' и 'avatarUrl'
      .exec(); // исполняем

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id; // сохраняем в postId введенный клиентом параметр query /:id

    PostModel.findOneAndUpdate(
      { _id: postId }, // ищем статью по совпадению id
      { $inc: { viewsCount: 1 } }, // увеличиваем кол-во просмотров на 1
      { returnDocument: 'after' } // и возвращаем в БД документ с обновленным кол-вом просмотров
    )
      .populate('user')
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({ message: 'Статья не найдена' });
        }

        res.json(doc);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Не удалось получить статью' });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить статью' });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id; // сохраняем в postId введенный клиентом параметр query /:id

    PostModel.findOneAndDelete({ _id: postId })
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({ message: 'Статья не найдена' });
        }

        res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Не удалось удалить статью' });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить статью' });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags.split(','),
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать статью' });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags.split(','),
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось обновить статью' });
  }
};

export const getLastTags = async (req, res) => {
  try {
    // Находим все статьи в БД
    const posts = await PostModel.find().exec();
    // Пробегаемся по массивам с тэгами каждого поста и соединяем их в один общий массив
    const tags = posts.map((obj) => obj.tags).flat();

    // Подсчитываем количество каждого тега и добавляем в объект acc
    const tagCounts = tags.reduce((acc, tag) => {
      if (acc[tag]) {
        acc[tag] += 1; // Увеличиваем счетчик, если тег уже существует
      } else {
        acc[tag] = 1; // Инициализируем счетчик, если тега еще нет
      }
      return acc;
    }, {});

    // Переводим объект в массив
    const mostPopularTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // сортируем теги по количеству встреч
      .slice(0, 5) // и выбираем первые 5
      .map((tags) => tags[0]); // Оставляем только название тэга, без количества

    res.json(mostPopularTags);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить тэги' });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    // Находим пост по ID
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Проверяем, лайкнул ли пользователь этот пост
    const isLiked = post.likedBy.includes(userId);
    // если да, то
    if (isLiked) {
      // Убираем лайк, если пользователь уже был в массиве и уменьшаем общее количество лайков на 1
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
      post.likesCount -= 1;
    } else {
      // Добавляем лайк
      post.likedBy.push(userId);
      post.likesCount += 1;
    }

    // Сохраняем изменения
    await post.save();

    res.json({ success: true, likesCount: post.likesCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось изменить лайк' });
  }
};
