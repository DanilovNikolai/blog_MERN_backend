import express from 'express';

const app = express();

const PORT = 4444;

app.get('/', (req, res) => console.log('Route test'));

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Server was started on PORT ${PORT}`);
});
