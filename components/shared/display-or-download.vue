
<template>
  <div class="display-download">
    <i v-if="showText()">
      <div
        v-for="log in fileContent"
        :key="log"
        class="log-item">
        <div v-if="typeof(log) === 'object'">
          <div
            v-for="logItem in log"
            :key="logItem"
            class="indent">
            {{ logItem }}
          </div>
        </div>
        <div v-else>
          {{ log }}
        </div>
      </div>
    </i>
    <a
      v-show="!fileContent"
      class="button-with-icon"
      title="Loading">
      <i class="material-icons spin">autorenew</i>
    </a>
    <a
      v-show="isAvailable"
      class="button-with-icon colored"
      @click="saveFile()">
      <i class="material-icons download-file">file_download</i>
      Download File
    </a>
  </div>
</template>

<script>
import {save} from 'assets/utils.js';
import 'assets/css/style.css';

export default {
  name: 'DisplayOrDownload',
  props: ['name', 'fileContent'],
  computed: {
    isAvailable() {
      let hasContent = this.fileContent &&
        !(this.fileContent.length === 1 &&
          this.fileContent[0].startsWith('No file')
        );
      if (hasContent) return true;
      return false;
    },
  },
  methods: {
    showText: function() {
      if (this.fileContent && this.fileContent.length < 10000) {
        if (this.fileContent.length === 1 && this.fileContent[0] === '') {
          this.fileContent = ['No file content found'];
        }
        return true;
      }
      return false;
    },
    saveFile: function() {
      save(this.name, this.fileContent);
    },
  },
};
</script>

<style scoped>
  .indent {
    margin-left: 20px;
  }
  div.indent:first-child {
    margin-left: 0;
  }
  .log-item {
    padding: 5px 0;
    word-break: break-word;
  }
  a.button-with-icon {
    letter-spacing: .5px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 3px;
    display: flex;
    align-items: center;
  }
  a.button-with-icon.colored {
    color: #fff;
    background-color: #879fcb;
    text-decoration: none;
  }
  .collapse-title a.button-with-icon.colored {
    margin-top: 10px;
    display: inline-flex;
  }
  a.no-link-style.router-link-active {
    text-decoration: none;
  }
</style>
