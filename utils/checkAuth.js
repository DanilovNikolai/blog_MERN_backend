import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      // Расшифровываем id из токена с помощью jwt
      const decoded = jwt.verify(token, 'secret');
      // Записываем id пользователя в req.userId
      req.userId = decoded._id;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Not Available' });
    }
  } else {
    return res.status(403).json({ message: 'Not available' });
  }
};
