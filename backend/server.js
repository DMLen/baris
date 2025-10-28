const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

//serve file thumbnails as url
app.use('/img/thumb', express.static(path.join(__dirname, 'img', 'thumb')));

//serve built frontend
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

var corsOptions = {
  origin: "http://localhost:3000"
};


app.get('/api', (req, res) => {
  res.json({ message: 'Service is online!' });
});

const imageRouter = require("./routes/image.routes.js");
const searchRouter = require("./routes/search.routes.js");
imageRouter(app);
searchRouter(app);

//sync db
const db = require('./models');
db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('DB sync error:', err);
});

//fallback route
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/img/thumb')) return next();
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`BARIS backend server is running on port ${PORT}.`);
});