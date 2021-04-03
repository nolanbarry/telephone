<template>
<div id="app">
  <div id="main-content">
    <div id="nav">
      <router-link to="/">Telephone</router-link> |
      <router-link to="/history">History</router-link>
    </div>
    <transition name='router-fade' mode='out-in'>
      <router-view />
    </transition>
  </div>
  <div id='footer'><a href='https://github.com/nolanbarry/telephone.git' target='_blank'><img src='./assets/github-dark.svg' /></a></div>
</div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#main-content {
  min-height: 100vh;
}

#footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

#footer img {
  width: 50px;
  height: 50px;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 10px;
}

.vertical {
  flex-flow: column;
}

.content {
  max-width: 1000px;
  width: 100%;
  text-align: left;
  padding: 10px;
}

.title {
  font-family: basic-sans, sans-serif;
  font-weight: 600;
  font-style: normal;
  font-size: 50px;
}

.description {
  font-family: basic-sans, sans-serif;
  font-weight: 300;
  font-style: normal;
  font-size: 20px;
  margin-bottom: 10px;
}

.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity 0.1s ease;
}

.router-fade-enter-from,
.router-fade-leave-to {
  opacity: 0;
}
</style>
