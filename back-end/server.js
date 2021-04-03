const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());

// connect to the database
mongoose.connect('mongodb://localhost:27017/telephone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const resultSchema = new mongoose.Schema({
  input: String,
  output: String,
  iterations: Number,
  votes: Number
})

const Result = mongoose.model('Result', resultSchema);

app.get('/api/results', async (req, res) => {
  try {
    let results = await Result.find()
    res.send(results)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post('/api/results', async (req, res) => {
  let result = new Result({
    input: req.input,
    output: req.output,
    iterations: req.iterations
  })
  try {
    await result.save()
    res.send(result)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.delete('/api/results/:id', async (req, res) => {
  Result.deleteOne({_id: req.params.id}, err => res.sendStatus(404))
})

app.put('/api/results/:id', async (req, res) => {
  let result = Result.findOne({_id: req.body.id})
  if (!result) {
    res.sendStatus(404)
    return
  }
  if (Math.abs(result.votes - req.body.votes) > 1) {
    res.sendStatus(400)
    return
  }
  result.votes = req.body.votes;
})

app.listen(3001, () => console.log('Server listening on port 3001!'));
