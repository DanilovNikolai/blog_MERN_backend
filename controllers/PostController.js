import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
  try {
    // Сохраняем в переменную все статьи из БД и связываем эту таблицу с таблицей 'user'
    const posts = await PostModel.find()
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
      tags: req.body.tags,
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
        tags: req.body.tags,
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
    // Находим первые 5 статей в БД
    const posts = await PostModel.find().limit(5).exec();
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить тэги' });
  }
};
