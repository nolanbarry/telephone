<template>
<div class='container'>
  <div class='content'>
    <div id='title'>Telephone!</div>
    <div id='description'>Put a sentence or phrase in the text box below and choose
      how many times you want to run it through the translator. Then click go and let 'er
      rip!</div>
    <form id='submission'>
      <textarea type="text" v-model="inputText" id='text-input' autofocus='true' placeholder='Peter Piper picked a peck of pickled peppers'></textarea>
      <div id='slider-container'>
        <input type="range" min="1" max="100" id="slider" v-model="inputIterations">
        <label for="slider">{{inputIterations}}</label>
      </div>
    </form>
    <div v-if="!loadingResult" class='container'>
      <button id='submit' type="button" @click="submit">Go!</button>
    </div>
    <div v-else class='container'>
      <Loading :width="35" />
    </div>
    <div id='console'>
      <div v-for='entry in console' :key='entry.entryNumber' class='console-entry'>
        <a :style="'color: ' + entry.textColor" class='console-text'>{{'\t' + entry.text}}</a>
        <a :style="'color: ' + entry.headerColor" class='console-header'>{{`[${entry.header}] `}}</a>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Loading from '../components/Loading.vue'
import Key from '../assets/SecretKey.js'
export default {
  name: "Telephone",
  components: {
    Loading
  },
  async mounted() {
    let response = await this.getLanguages()
    this.languages = response.data.dictionary
  },
  data() {
    return {
      inputText: '',
      inputIterations: 25,
      loadingResult: false,
      console: [],
      languages: null
    }
  },
  methods: {
    async submit() {
      if (this.languages == null) {
        this.log("Still awaiting call for language list, please try again in a second.", "ERROR")
        return
      }
      if (this.inputText == '') {
        this.log("Please type in some input.", "ERROR")
        return
      }
      this.loadingResult = true
      let iterations = this.inputIterations
      let currentText = this.inputText
      let previousLanguage = null
      let nextLanguage = 'en'
      let headerColor = '#aaaaaa'
      let useFullName = false
      this.log(currentText, 'INPUT', '#92FF92')
      for (let i = 0; i < iterations; ++i) {
        previousLanguage = nextLanguage
        let keys = Object.keys(this.languages)
        nextLanguage = keys[Math.floor(Math.random() * keys.length)]
        let translation = (await this.translate(currentText, previousLanguage, nextLanguage)).data[0].translations;
        this.log(translation[0].text,
          `${useFullName ? this.languages[previousLanguage].name : previousLanguage} >> ${useFullName ? this.languages[nextLanguage].name : nextLanguage}`,
          headerColor)
        currentText = translation[0].text;
      }
      let translation = (await this.translate(currentText, nextLanguage, 'en')).data[0].translations
      this.log(translation[0].text,
        'FINAL RESULT',
        '#92FF92')
      this.loadingResult = false
    },
    getLanguages() {
      const axios = require('axios').default
      const {
        v4: uuidv4
      } = require('uuid')

      var subscriptionKey = Key.key
      var endpoint = "https://api.cognitive.microsofttranslator.com"

      // Add your location, also known as region. The default is global.
      // This is required if using a Cognitive Services resource.
      var location = "global"

      return axios({
        baseURL: endpoint,
        url: '/languages',
        method: 'get',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Ocp-Apim-Subscription-Region': location,
          'Content-type': 'application/json',
          'X-ClientTraceId': uuidv4().toString()
        },
        params: {
          'api-version': '3.0',
        },
        responseType: 'json'
      })
    },
    translate(text, from, to) {
      const axios = require('axios').default;
      const {
        v4: uuidv4
      } = require('uuid');

      var subscriptionKey = Key.key;
      var endpoint = "https://api.cognitive.microsofttranslator.com";

      // Add your location, also known as region. The default is global.
      // This is required if using a Cognitive Services resource.
      var location = "global";

      return axios({
        baseURL: endpoint,
        url: '/translate',
        method: 'post',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Ocp-Apim-Subscription-Region': location,
          'Content-type': 'application/json',
          'X-ClientTraceId': uuidv4().toString()
        },
        params: {
          'api-version': '3.0',
          'from': from,
          'to': [to, 'en']
        },
        data: [{
          'text': text
        }],
        responseType: 'json'
      })
    },
    log(text, header, headerColor = '#ff0000', textColor = '#eeeeee') {
      this.console.unshift({
        text,
        header,
        headerColor,
        textColor,
        entryNumber: this.console.length
      })
    }
  },
  computed: {
    consoleLog() {
      return this.console.reduce((sum, next) => sum + next + '\n', '');
    }
  },
  watched: {
    consoleLog(newValue) {
      console.log(newValue);
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  margin: 10px;
}

.content {
  max-width: 1000px;
  text-align: left;
  padding: 10px;
}

#title {
  font-family: basic-sans, sans-serif;
  font-weight: 600;
  font-style: normal;
  font-size: 50px;
}

#description {
  font-family: basic-sans, sans-serif;
  font-weight: 300;
  font-style: normal;
  font-size: 20px;
  margin-bottom: 10px;
}

#submission {
  display: flex;
}

#text-input {
  resize: vertical;
  min-height: 140px;
  max-height: 500px;
  width: 90%;
  border: 2px solid #1f1f1f;
  border-radius: 10px;
  padding: 5px;
  font-family: basic-sans, sans-serif;
  font-weight: 300;
  font-style: normal;
  font-size: 18px;
}

#slider-container {
  display: flex;
  flex-flow: column;
  align-items: center;
  width: 10%
}

#slider {
  -webkit-appearance: slider-vertical;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
  width: 40px;
}

label {
  font-family: basic-sans, sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 15px;
}

.slider:hover {
  opacity: 1;
}

#submit {
  width: 100px;
  height: 40px;
  border-radius: 20px;
  background-color: #5BBBFF;
  font-family: basic-sans, sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 25px;
  border: none;
  border-bottom: 4px solid #0090F8;
  text-transform: uppercase;
  outline: none;
}

#submit:active {
  outline: none;
  border-bottom: 2px solid #0090F8;
}

#console {
  background-color: #2f2f2f;
  box-shadow: inset 2px 2px 3px rgba(0, 0, 0, 1);
  border: none;
  border-radius: 20px;
  width: 100%;
  max-height: 50vh;
  resize: none;
  border: none;
  user-select: none;
  padding: 10px;
  overflow: scroll;
  overflow-x: hidden;
  margin: auto;
}

.console-entry {
  font-family: source-code-pro, monospace;
  font-weight: 400;
  font-style: normal;
  font-size: 20px;
  color: #eeeeee;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.console-header {
  font-size: 16px;
  flex: none;
}

.console-text {
  max-width: 80%;
}
</style>
