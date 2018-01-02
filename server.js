'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser').urlencoded({extended: true});

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const TOKEN = process.env.TOKEN;

app.use(cors());

app.get('/api/v1/users', (req, res) => res.send(TOKEN === parseInt(req.query.token)))

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.get('/api/v1/users', (req, res) => {
  client.query(`SELECT * FROM users;`)
  .then(results => res.send(results.rows))
  .catch(console.error);
});

app.get('api/v1/recipes/:id', (req,res) => {
  client.query(`SELECT * FROM recipe WHERE user_id = ${req.params.id};`)
  .then (results => res.send(results.rows))
  .catch (console.error);
});


app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
