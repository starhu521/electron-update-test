<template>
  <div id='app'>
    <div class='test'>
      <div>{{version}}</div>
      <button @click='check()'>check</button>
      <button @click='download()'>download</button>
      <button @click='install()'>install</button>
      <button @click='auto()'>auto-install</button>
      <div>version: {{ version }}</div>
      <div>
        info:
        <div v-for='item in info' :key='item'>{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import { ipcRenderer } from 'electron';
import { IPCRENDER_UPDATE_APP_INFO } from '@/constants';

const { version } = require('../package.json');

export default Vue.extend({
  name: 'App',
  data() {
    return {
      version: version,
      info: [''],
    };
  },
  created() {
    ipcRenderer.on(IPCRENDER_UPDATE_APP_INFO, (e, data) => {
      this.info = [...this.info, JSON.stringify(data)];
      console.log(data);
    });
  },
  methods: {
    check() {
      ipcRenderer.send('check');
    },
    download() {
      ipcRenderer.send('download');
    },
    install() {
      ipcRenderer.send('install');
    },
    auto() {
      ipcRenderer.send('auto');
    }
  },
});
</script>

<style>
#app {
  position: absolute;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.test {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  font-size: 16px;
  background-color: #000000;
  color: #ffffff;
}
button {
  width: 200px;
  height: 100px;
  margin: 10px;
  background-color: #ffffff;
  color: #000000;
}
</style>
