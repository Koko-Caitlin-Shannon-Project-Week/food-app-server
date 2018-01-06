'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser')
const superagent = require('superagent');
const APP_KEY = process.env.APP_KEY;
const APP_ID = process.env.APP_ID;

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.get('/api/v1/users', (req, res) => {
  client.query(`SELECT * FROM user;`)
  .then(results => res.send(results.rows))
  .catch(console.error);
});


app.post('/api/v1/users', (req, res) => {
  client.query(
    `INSERT INTO users(username, password) VALUES($1, $2);`,
    [req.body.username, req.body.password],
    function() {
      queryTwo();
    }
  );

  function queryTwo() {
    client.query(
      `SELECT user_id FROM users WHERE username=$1;`,
      [req.body.username],
      function(err, result) {
        queryThree(result.rows[0].user_id)
      }
    );
  }

  function queryThree(user_id) {
    client.query(
      `INSERT INTO recipes(user_id) VALUES ($1);`,
      [user_id],
      function() {
        res.send(user_id);
      }
    );
  }
});

app.get('/api/v1/users/id/:uname/:pword', (req, res) => {
  console.log(req.params.uname, req.params.pword);
  client.query(`SELECT user_id FROM users WHERE username='${req.params.uname}' AND password='${req.params.pword}';`)
  .then(results => res.send(results.rows[0]))
  .catch(console.error);
});

app.get('/api/v1/recipes/search', (req, res) =>{
  superagent.get(`https://api.edamam.com/search?q=chicken&app_id=${APP_ID}&app_key=${APP_KEY}`)
  .then (result => res.send(result))
});
app.get('/api/v1/recipes/search/:ing', (req, res) =>{
  superagent.get(`https://api.edamam.com/search?q=${req.params.ing}&app_id=${APP_ID}&app_key=${APP_KEY}`)
  .then (result => res.send(result))
});

app.get('/api/v1/recipes/:id', (req,res) => {
  client.query(`SELECT * FROM recipes WHERE user_id = ${req.params.id};`)
  .then (results => res.send(results.rows))
  .catch (console.error);
});

app.put('/api/v1/recipes/:id/:day', (req, res) => {
  client.query(`UPDATE recipes SET ${req.params.day} = ($1) WHERE user_id = ${req.params.id};`, [JSON.stringify(req.body)])
  .then(data => res.send(data))
});



app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
