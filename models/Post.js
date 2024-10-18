import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      unique: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Массив пользователей, которые лайкнули пост
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Ссылка на модель пользователей
      required: true,
    },
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', PostSchema);
