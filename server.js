const express = require('express');
const path = require('path');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Personal Hub & Dashboard running on port ${PORT}`);
});