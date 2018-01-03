'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser').urlencoded({extended: true});
const superagent = require('superagent');
const API_KEY = process.env.API_KEY;

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.get('/api/v1/users', (req, res) => {
  client.query(`SELECT * FROM users;`)
  .then(results => res.send(results.rows))
  .catch(console.error);
});


app.post('/api/v1/users', bodyParser, (req, res) => {
  let {username, password} = req.body;
  client.query(`INSERT INTO users(username, password) VALUES($1, $2)`,
  [username, password])
  .then(results => res.sendStatus(201));
});

app.get('/api/v1/recipes/:id', (req,res) => {
  client.query(`SELECT * FROM recipes WHERE user_id = ${req.params.id};`)
  .then (results => res.send(results.rows))
  .catch (console.error);

  
});

app.get('/api/v1/recipes/find/:day_id', (req,res) =>{
  superagent.get(`https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/${req.params.day_id}/analyzedInstructions?stepBreakdown=true`)
  .set('X-Mashape-Key', 'API_KEY').set('Accept', 'application/json')
  .then(res => console.log(res.body))

})

//app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/324694/analyzedInstructions?stepBreakdown=true")
// .header("X-Mashape-Key", "")
// .header("Accept", "application/json")
// .end(function (result) {
//   console.log(result.status, result.headers, result.body);
// });
