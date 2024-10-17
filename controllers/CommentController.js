import CommentModel from '../models/Comment.js';

export const getAll = async (req, res) => {
  try {
    // Сохраняем в переменную все статьи из БД и связываем эту таблицу с таблицей 'user'
    const comments = await CommentModel.find()
    .populate('userId', 'fullName avatarUrl') // Получаем fullName и avatarUrl пользователя
    .sort({ createdAt: -1 })
    .exec(); // исполняем

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить комментарии' });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      fullName: req.body.fullName,
      userId: req.body.userId,
      postId: req.body.postId,
      text: req.body.text,
    });

    const comment = await doc.save();
    if (!comment) {
      console.log('Failed to save comment');
      return res.status(500).json({ message: 'Комментарий не был сохранен' });
    }
    console.log('Comment saved:', comment);
    res.json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать комментарий' });
  }
};

export const remove = async (req, res) => {
  try {
    const commentId = req.params.id; // сохраняем в postId введенный клиентом параметр query /:id

    CommentModel.findOneAndDelete({ _id: commentId })
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({ message: 'Комментарий не найден' });
        }

        res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Не удалось удалить комментарий' });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить комментарий' });
  }
};
