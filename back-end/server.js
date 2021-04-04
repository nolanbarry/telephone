const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const requestIp = require('request-ip');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());

// use request-ip middleware
app.use(requestIp.mw())

// connect to the database
mongoose.connect('mongodb://localhost:27017/telephone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const resultSchema = new mongoose.Schema({
  input: String,
  output: String,
  iterations: Number,
})

const voteSchema = new mongoose.Schema({
  resultID: String,
  userIP: String,
  vote: Number
})

const createSchema = new mongoose.Schema({
  creatorIP: String,
  resultID: String
})

const Result = mongoose.model('Result', resultSchema)
const Vote = mongoose.model('Vote', voteSchema)
const Creator = mongoose.model('Creator', createSchema)

async function getVotes(r) {
  return (await Vote.find({resultID: r._id})).reduce((sum, next) => sum + next.vote, 0)
}

async function removeResult(id) {
  await Result.deleteOne({_id: id})
  await Vote.deleteMany({resultID: id})
}

app.get('/api/results', async (req, res) => {
  try {
    let results = await Result.find()
    let resultsVotes = []
    for(let r of results) {
      let votes = await getVotes(r)
      resultsVotes.push({
        content: r,
        votes: votes
      })
    }
    res.send(resultsVotes)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.get('/api/results/myvotes', async(req, res) => {
  try {
    let votes = await Vote.find({userIP: req.clientIp});
    res.send(votes);
  } catch (error) {
    res.sendStatus(500)
  }
})

app.get('/api/results/mycreations', async(req, res) => {
  try {
    let creations = await Creator.find({creatorIP: req.clientIp});
    res.send(creations.map(x => x.resultID));
  } catch (error) {
    res.sendStatus(500)
  }
})

app.get('/api/results/:id', async (req, res) => {
  try {
    let result = await Result.findOne({_id: req.params.id})
    if (!result) {
      res.sendStatus(404)
    }
    res.send({content: result, votes: await getVotes(result)})
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post('/api/results', async (req, res) => {
  let result = new Result({
    input: req.body.input,
    output: req.body.output,
    iterations: req.body.iterations,
  })
  let creator = new Creator({
    creatorIP: req.clientIp,
    resultID: result._id
  })
  try {
    await result.save()
    await creator.save()
    res.send(result)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.delete('/api/results/:id', async (req, res) => {
  try {
    if (req.clientIp != (await Creator.findOne({resultID: req.params.id})).creatorIP) {
      res.sendStatus(403)
      return
    }
  } catch (error) {}
  let item = Result.findOne({_id: req.params.id})
  if (!item)
    res.sendStatus(404)
  else {
    removeResult(req.params.id)
    res.sendStatus(200)
  }
})

app.put('/api/results/:id/vote', async (req, res) => {
  if (req.body.vote == 0) {
    await Vote.deleteOne({resultID: req.params.id, userID: req.clientIp})
    res.sendStatus(200)
    return
  }
  let existingVote = await Vote.findOne({resultID: req.params.id, userID: req.clientIp})
  if (existingVote) {
    // update existing vote value
    existingVote.vote = req.body.vote
  } else {
    // create new vote
    existingVote = new Vote({
      resultID: req.params.id,
      userIP: req.clientIp,
      vote: req.body.vote
    })
  }
  try {
    await existingVote.save()
    let result = await Result.findOne({_id: req.params.id})
    if (await getVotes(result) < -2) removeResult(req.params.id)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.listen(3001, () => console.log('Server listening on port 3001!'));
