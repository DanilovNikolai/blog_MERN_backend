import express from 'express';
import 'dotenv/config';
// для работы с MongoDB
import mongoose from 'mongoose';

const PORT = process.env.PORT;
const app = express();

// data base connection
mongoose
  .connect(
    `mongodb+srv://Danilov:${process.env.DB_PASSWORD}@test-cluster.9rnehkm.mongodb.net/?retryWrites=true&w=majority&appName=Test-cluster`
  )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

// routes
app.get('/', (req, res) => console.log('Route test'));

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${PORT}`);
});
