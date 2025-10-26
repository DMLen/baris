const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

var corsOptions = {
  origin: "http://localhost:3000"
};


app.get('/api', (req, res) => {
  res.json({ message: 'Service is online!' });
});

const imageRouter = require("./routes/image.routes.js");
//const hashRouter = require("./routes/hash.routes.js");
imageRouter(app);
//app.use('/api/hash', hashRouter);

//sync db
const db = require('./models');
db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('DB sync error:', err);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`BARIS backend server is running on port ${PORT}.`);
});