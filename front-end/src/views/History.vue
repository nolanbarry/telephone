<template>
<div class='container'>
  <div class='content'>
    <div class='title'>History</div>
    <div class='description'>
      View and vote on results history.
      Results with a score of -3 or less will be automatically removed, or you can remove your own.
    </div>
    <div v-if="!loading">
      <div v-if="history.length > 0">
        <transition-group name='list'>
          <div v-for="entry in history" :key="entry.content._id">
            <div v-if="ownedByMe.includes(entry.content._id)" class='delete-container'>
              <button class='delete-entry' @click='remove(entry.content._id)'><i class="fas fa-times"></i></button>
            </div>
            <div class='entry'>
              <div class='vote-container'>
                <div class='up vote' @click='upvote(entry.content._id)'>
                  <img src="images/arrow.svg" v-if='!voteState[entry.content._id].up' />
                  <img src="images/arrow-selected.svg" v-else />
                </div>
                <div class='vote-value'>{{entry.votes}}</div>
                <div class='down vote' @click='downvote(entry.content._id)'>
                  <img src="images/arrow.svg" v-if='!voteState[entry.content._id].down' />
                  <img src="images/arrow-selected.svg" v-else />
                </div>
              </div>
              <div class='entry-text-container'>
                <div class='entry-header'>[result]</div>
                <div class='entry-text'>"{{entry.content.output}}"</div>
                <div class='entry-header'>[from input]</div>
                <div class='entry-text'>"{{entry.content.input}}"</div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      <div v-else class='empty'>Your history is currently empty.</div>
    </div>
    <div v-else class='loader'>
      <Loading :width="35" />
    </div>
  </div>
</div>
</template>

<script>
const axios = require('axios');
import Loading from '../components/Loading.vue'
let intervalID;
export default {
  name: 'History',
  components: {
    Loading
  },
  async created() {
    this.loading = true;
    await this.updateHistory()
    this.loading = false;
    intervalID = setInterval(this.updateHistory, 3000);
  },
  destroyed() {
    clearInterval(intervalID);
  },
  data() {
    return {
      history: [],
      ownedByMe: [],
      voteState: {},
      loading: false,
      intervalID: null
    }
  },
  methods: {
    async remove(id) {
      this.history = this.history.filter(e => e.content._id != id);
      this.$delete(this.voteState, id + "")
      await axios.delete('/api/results/' + id);
      await this.updateHistory();
    },
    async updateHistory() {
      this.history = (await axios.get('/api/results')).data.sort((a, b) => {
        return b.votes - a.votes;
      });
      await this.updateVotes();
      await this.updateOwnership();
    },
    async updateVotes() {
      let myVotes = (await axios.get('/api/results/myvotes')).data;
      for (let item of this.history) {
        if (!this.voteState[item.content._id]) {
          this.$set(this.voteState, item.content._id, {
            up: false,
            down: false,
          })
        }
      }
      for (let vote of myVotes) {
        this.voteState[vote.resultID].up = (vote.vote == 1)
        this.voteState[vote.resultID].down = (vote.vote == -1)
      }
    },
    async updateOwnership() {
      this.ownedByMe = (await axios.get('/api/results/mycreations')).data
    },
    async upvote(id) {
      let beforeValue = this.voteState[id].up ? 1 : (this.voteState[id].down ? -1 : 0)
      this.voteState[id].up = !this.voteState[id].up
      this.voteState[id].down = false
      let newValue = this.voteState[id].up ? 1 : (this.voteState[id].down ? -1 : 0)
      for (let i = 0; i < this.history.length; ++i) {
        if (this.history[i].content._id == id) {
          this.history[i].votes += newValue - beforeValue;
        }
      }
      this.sortHistory()
      await axios.put(`/api/results/${id}/vote`, {
        vote: this.voteState[id].up ? 1 : 0
      })
      this.updateHistory()
    },
    async downvote(id) {
      let beforeValue = this.voteState[id].up ? 1 : (this.voteState[id].down ? -1 : 0)
      this.voteState[id].down = !this.voteState[id].down
      this.voteState[id].up = false
      let newValue = this.voteState[id].up ? 1 : (this.voteState[id].down ? -1 : 0)
      for (let i = 0; i < this.history.length; ++i) {
        if (this.history[i].content._id == id) {
          this.history[i].votes += newValue - beforeValue;
        }
      }
      this.sortHistory()
      await axios.put(`/api/results/${id}/vote`, {
        vote: this.voteState[id].down ? -1 : 0
      })
      this.updateHistory()
    },
    sortHistory() {
      this.history = this.history.sort((a, b) => {
        return b.votes - a.votes;
      });
    }
  }

}
</script>

<style scoped>
.entry {
  background-color: #1f1f1f;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  display: flex;
  align-items: center;
  margin-left: 35px;
}

.entry-header {
  font-family: source-code-pro, monospace;
  font-weight: 400;
  font-style: normal;
  font-size: 15px;
  color: #aaaaaa;
}

.entry-text {
  font-family: basic-sans, sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 25px;
  color: #eeeeee;
  margin-left: 2%;
  word-wrap: break-word;
}

.entry-text-container {}

.vote-container {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  max-height: 80px;
  margin-left: -50px;
  margin-right: 15px;
  user-select: none;
}

.vote {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  margin: 5px;
  opacity: 0.9;
}

.down {
  transform: rotate(180deg);
}

.vote:hover {
  opacity: 0.5;
  cursor: pointer;
}

.vote:active {
  opacity: 0.9;
}

.vote-value {
  font-family: basic-sans, sans-serif;
  font-weight: 600;
  font-style: normal;
  font-size: 30px;
  color: #1f1f1f;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty {
  font-family: basic-sans, sans-serif;
  font-weight: 600;
  font-style: normal;
  font-size: 30px;
  color: #1f1f1f;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-container {
  height: 0px;
  overflow: visible;
  margin: 0 20px 0 10px;
  display: flex;
  justify-content: flex-end;

}

.delete-entry {
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  outline: none;
  margin-left: auto;
  margin-top: 28px;
  color: #eeeeee;
  font-size: 20px;
  transition: transform 0.2s;
}

.delete-entry:hover {
  cursor: pointer;
  transform: scale(1.3);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s;

}

.list-enter,
.list-leave-to {
  opacity: 0;
}

.list-move {
  transition: transform 0.3s;
}

.loader {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

@media only screen and (max-width: 640px) {
  .empty {
    font-size: 25px;
  }

  .entry-header {
    font-size: 12px;
  }

  .entry-text {
    font-size: 20px;
  }
}
</style>
