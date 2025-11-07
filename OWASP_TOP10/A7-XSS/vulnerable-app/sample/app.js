const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory store for stored XSS demo
const comments = [];

// Reflected XSS
app.get('/reflected', (req, res) => {
  const q = req.query.q || '';
  // Vulnerable: reflecting without escaping intentionally for demo
  res.render('reflected', { q });
});

// Stored XSS
app.get('/stored', (req, res) => {
  res.render('stored', { comments });
});
app.post('/stored', (req, res) => {
  const { name = 'anon', comment = '' } = req.body;
  comments.push({ name, comment });
  res.redirect('/stored');
});

// DOM-based XSS
app.get('/dom', (req, res) => {
  res.render('dom');
});

app.listen(port, () => {
  console.log(`XSS playground running: http://localhost:${port}`);
});
