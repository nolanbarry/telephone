<template>
<div class='container'>
  <div class='content'>
    <div class='title'>History</div>
    <div class='description'>View your results history.</div>
    <div v-if="hist.length > 0">
      <transition-group name='list'>
        <div v-for="entry in hist" :key="entry.id">
          <div class='delete-container'>
            <button class='delete-entry' @click='remove(entry.id)'><i class="fas fa-times"></i></button>
          </div>
          <div class='entry'>
            <div class='entry-header'>[result]</div>
            <div class='entry-text'>"{{entry.entry.translation}}"</div>
            <div class='entry-header'>[from input]</div>
            <div class='entry-text'>"{{entry.entry.input}}"</div>
          </div>
        </div>
      </transition-group>
    </div>
    <div v-else class='empty'>Your history is currently empty.</div>
  </div>
</div>
</template>

<script>
export default {
  name: 'History',
  computed: {
    hist() {
      let i = 0;
      return this.$root.$data.history.map(x => {
        return {
          entry: x,
          id: i++,
          collect: false
        }
      });
    }
  },
  methods: {
    remove(id) {
      this.$root.$data.history = this.hist.filter(e => e.id != id).map(e => e.entry);
    },
  }

}
</script>

<style scoped>
.entry {
  background-color: #1f1f1f;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
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
