<template>
<div class='container'>
  <div class='content'>
    <div class='title'>Telephone!</div>
    <div class='container' id='body'>
      <div class='description'>Put a sentence or phrase in the text box below and choose
        how many times you want to run it through the translator. Then click go and let 'er
        rip! You can use the autofill button to have it fill in some random corporate speak for you.
        Once its done, you have the option to submit your result to the public history. Keep it nice!
      </div>
      <div v-if="!loadingResult" class='container' id='button-container'>
        <button id='submit' class='button' type="button" @click="submit">Go!</button>
        <button id='autofill' class='button' type="button" @click="autofill">Autofill</button>
      </div>
      <div v-else class='container' id='loading-container'>
        <Loading :width="35" />
      </div>
    </div>
    <div id='submission' onsubmit="return false;">
      <textarea type="text" v-model="inputText" id='text-input' autofocus='true' placeholder='Peter Piper picked a peck of pickled peppers'></textarea>
      <div id='slider-container'>
        <input type="range" min="1" max="100" id="slider" v-model="inputIterations">
        <label for="slider">{{inputIterations}}</label>
      </div>
    </div>
    <div id='console'>
      <div v-for='entry in console' :key='entry.entryNumber' class='console-entry'>
        <a :style="'color: ' + entry.textColor" class='console-text'>{{'\t' + entry.text}}</a>
        <a v-if="!entry.submittable" :style="'color: ' + entry.headerColor" class='console-header'>{{`[${entry.header}] `}}</a>
        <a v-else :style="`color: ${entry.headerColor};`" class='console-header'>
          [<a :style="`color: ${entry.headerColor}; border-bottom-color: ${entry.headerColor};`" :class='`console-header ${!entry.submitted ? "submittable" : ""}`' @click="submitResult(entry)">{{entry.submitted ? 'SUBMITTED' : 'SUBMIT'}}</a>]
        </a>
      </div>
    </div>
    <div id='console-controls'>
      <button id='toggle-full-names' class='console-button' @click='toggleNames'>
        <i v-if='useFullNames' class="far fa-square"></i>
        <i v-else class="fas fa-check-square"></i>
      </button>
      <label class='console-label'>Abbreviate Language Names</label>
      <button id='clear-console' class='console-button' @click='clear'><i class="far fa-trash-alt"></i>
      </button>
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
      languages: null,
      useFullNames: false
    }
  },
  methods: {
    async submit() {
      if (this.languages == null) {
        this.log("Still awaiting call for language list, please try again in a second.", "ERROR")
        return
      }
      this.inputText = this.inputText.trim()
      if (this.inputText == '') {
        this.log("Please type in some input.", "ERROR")
        return
      }
      this.loadingResult = true
      let input = this.inputText;
      let currentText = input;
      let iterations = this.inputIterations
      let previousLanguage = null
      let nextLanguage = 'en'
      let headerColor = '#aaaaaa'
      this.log(currentText, 'INPUT', '#92FF92')
      for (let i = 0; i < iterations; ++i) {
        previousLanguage = nextLanguage
        let keys = Object.keys(this.languages)
        nextLanguage = keys[Math.floor(Math.random() * keys.length)]
        let translation = (await this.translate(currentText, previousLanguage, nextLanguage)).data[0].translations;
        this.log(translation[0].text,
          `${this.useFullNames ? this.languages[previousLanguage].name : previousLanguage} >> ${this.useFullNames ? this.languages[nextLanguage].name : nextLanguage}`,
          headerColor)
        currentText = translation[0].text;
      }
      let translation = (await this.translate(currentText, nextLanguage, 'en')).data[0].translations[0].text;
      this.log(translation, 'FINAL RESULT', '#92FF92');
      this.submitLog(input, translation, iterations)
      this.loadingResult = false;
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
        entryNumber: this.console.length,
        submittable: false
      })
    },
    submitLog(input, output, iterations, headerColor = '#92FF92', textColor = '#eeeeee') {
      this.console.unshift({
        text: output,
        header: 'FINAL RESULT',
        headerColor,
        textColor,
        submittable: true,
        submitted: false,
        input,
        iterations
      })
    },
    clear() {
      this.console = [];
    },
    toggleNames() {
      this.useFullNames = !this.useFullNames
    },
    async autofill() {
      let axios = require("axios");
      this.loadingResult = true;
      const options = {
        method: 'GET',
        url: 'https://sameer-kumar-corporate-bs-generator-v1.p.rapidapi.com/',
        headers: {
          'x-rapidapi-key': '3d3030e783mshe940a7cb472611bp158d5ejsn06e0c0ffcfdc',
          'x-rapidapi-host': 'sameer-kumar-corporate-bs-generator-v1.p.rapidapi.com'
        }
      };
      let fill = await axios.request(options);
      this.inputText = fill.data.phrase;
      this.loadingResult = false;
    },
    async submitResult(result) {
      if (result.submittable && !result.submitted) {
        const axios = require('axios')
        axios.post('/api/results', {
          input: result.input,
          output: result.text,
          iterations: result.iterations
        })
        result.submitted = true;
      }
    }
  },
}
</script>

<style scoped>
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

.button {
  width: 100px;
  height: 40px;
  border-radius: 20px;
  font-family: basic-sans, sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 25px;
  border-width: 0px 0px 4px 0px;
  text-transform: uppercase;
  outline: none;
  margin-bottom: 2px;
  color: #2f2f2f;
}

.button:active {
  outline: none;
  border-width: 0px 0px 2px 0px;
  transform: translate3d(0px, 1px, 0);
  transition: all 0.1s;
}

#button-container {
  flex-flow: column-reverse;
  min-width: 100px;
}

#submit {
  background-color: #5BBBFF;
  border-bottom-color: #0090F8;
}

#autofill {
  background-color: #92FF92;
  border-bottom-color: #00E600;
  font-size: 17px;
}

#loading-container {
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#console {
  background-color: #2f2f2f;
  box-shadow: inset 2px 2px 3px rgba(0, 0, 0, 1);
  border: none;
  border-radius: 20px;
  width: 100%;
  min-height: 50vh;
  max-height: 50vh;
  resize: none;
  border: none;
  user-select: none;
  padding: 10px;
  overflow: scroll;
  overflow-x: hidden;
  margin-top: 20px;
}

#console::-webkit-scrollbar {
  display: block;
  width: 8px;
  min-width: 8px;
  background-color: transparent;
}

#console::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.3);
}

#console::-webkit-scrollbar-track-piece:end {
  background: transparent;
  margin-bottom: 12px;
}

#console::-webkit-scrollbar-track-piece:start {
  background: transparent;
  margin-top: 12px;
}

.console-entry {
  font-family: source-code-pro, monospace;
  font-weight: 400;
  font-style: normal;
  font-size: 20px;
  color: #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.console-header {
  font-size: 16px;
  flex: none;
}

.console-text {
  max-width: 80%;
}

.submittable {
  text-decoration: none;
  border-bottom-width: 3px;
  border-bottom-style: dashed;
}

.submittable:hover {
  text-decoration: none;
  border-bottom-style: solid;
  cursor: pointer;
}

#console-controls {
  font-family: source-code-pro, monospace;
  font-weight: 400;
  font-style: normal;
  font-size: 20px;
  display: flex;
  justify-content: flex-end;
}

.console-button {
  font-size: 28px;
  margin: 10px;
  margin-right: 4px;
  background: transparent;
  border: none;
  outline: none;
  transition: transform 0.3s;
}

.console-button:hover {
  cursor: pointer;
  transform: scale(1.2);
}

.console-label {
  user-select: none;
  font-size: 15px;
  display: flex;
  align-items: center;
}

@media only screen and (max-width: 640px) {
  .description {
    font-size: 16px;
  }

  #loading-container {
    width: 100%;
  }

  #submit {
    margin-left: 10px;
  }

  #text-input {
    font-size: 13px;
  }

  #button-container {
    flex-flow: row-reverse;
  }

  #body {
    flex-flow: column;
  }

  .console-entry {
    font-size: 12px;
  }

  .console-header {
    font-size: 11px;
    margin-right: -10px;
  }

  .console-label {
    font-size: 13px;
  }

  .console-button {
    font-size: 20px;
  }
}
</style>
