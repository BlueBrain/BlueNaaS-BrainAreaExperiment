
<template>
  <div>

    <i v-if="showText">
      <div
        v-for="(log, ind) in formatedTextAsArray"
        :key="log + ind"
        class="log-item"
      >
        <!-- Allow array of array with indentation -->
        <div v-if="typeof(log) === 'object'">
          <div
            v-for="(logItem, index) in log"
            :key="logItem + index"
            class="indent"
          >{{ logItem }}</div>
        </div>
        <div v-else>{{ log }}</div>
      </div>
    </i>

    <span
      v-show="!fileContent && fileContent !== ''"
      class="button-with-icon"
      title="Loading"
    >
      <icon type="md-sync" size="20" class="spin" />
    </span>

    <div v-if="isAvailable && !showText">
      <h3>(File is too big to show in this page. Please Download it)</h3>
    </div>
    <i-button
      v-show="isAvailable"
      type="primary" icon="md-download"
      @click="saveFile"
    >Download File</i-button>

  </div>
</template>


<script>
import fileSaver from 'file-saver';

const MAX_FILE_SIZE_TO_SHOW = 10000; // 10 KB

export default {
  name: 'DisplayOrDownload',
  props: ['fileName', 'fileContent'],
  computed: {
    isAvailable() {
      const hasContent = this.formatedTextAsArray &&
        !(this.formatedTextAsArray.length === 1 &&
          this.formatedTextAsArray[0].startsWith('File')
        );
      return hasContent;
    },
    showText() {
      // check if the file is not so big to avoid stack overflow of arrays in client
      return this.fileContent && this.fileContent.length < MAX_FILE_SIZE_TO_SHOW;
    },
    formatedTextAsArray() {
      if (!this.fileContent) return ['File is loading'];
      if (!Array.isArray(this.fileContent)) {
        return this.fileContent.split('\n');
      }
      return this.fileContent;
    },
  },
  methods: {
    saveFile() {
      let text = this.fileContent;
      if (Array.isArray(this.fileContent)) {
        text = this.fileContent.join('\n');
      }
      const file = new File([text], this.fileName, { type: 'text/plain;charset=utf-8' });
      fileSaver.saveAs(file);
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
    padding: 2px 0;
    word-break: break-word;
  }
  .collapse-title a.button-with-icon.colored {
    margin-top: 10px;
    display: inline-flex;
  }
</style>
