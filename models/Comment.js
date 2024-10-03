import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // обратная связь с постом
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Comment', CommentSchema);
