import CommentModel from '../models/Comment.js';

export const getAll = async (req, res) => {
  try {
    // Сохраняем в переменную все статьи из БД и связываем эту таблицу с таблицей 'user'
    const comments = await CommentModel.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec(); // исполняем

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить комментарии' });
  }
};

export const getByPostId = async (req, res) => {
  try {
    // Если передан `postId` в query, получаем комментарии для конкретного поста
    const { postId } = req.query;

    const comments = await CommentModel.find(postId ? { post: postId } : {}) // фильтруем комменты по postId
      .sort({ createdAt: -1 })
      .exec();

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить комментарии' });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      user: req.userId,
      post: req.postId,
      text: req.body.text,
      imageUrl: req.imageUrl,
    });

    const comment = await doc.save();

    res.json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать комментарий' });
  }
};
