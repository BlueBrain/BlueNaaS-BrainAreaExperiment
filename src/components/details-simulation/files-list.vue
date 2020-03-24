
<template>
  <div class="files-container">
    <div v-for="file in list" :key="file.name">
      <badge status="success"/>
      <span class="file-name-size">{{ file.name }} ({{ file.size }})</span>
      <div class="inline-block">
        <i-button
          type="primary" icon="md-download" ghost
          @click="downloadLazy(file)"
          :disabled="file.isDownloading || !canDownload(file.rawSize)"
          :loading="file.isDownloading"
        >{{ canDownload(file.rawSize) ? 'Download' : 'File is too big' }}</i-button>
      </div>
    </div>
  </div>
</template>


<script>
import { getFiles } from '@/services/unicore';
import fileSaver from 'file-saver';

const MAX_FILE_SIZE_TO_DOWNLOAD = 30000000; // 30 MB

export default {
  name: 'FilesList',
  props: ['list', 'workingDir'],
  methods: {
    canDownload(fileRawSize) {
      return fileRawSize < MAX_FILE_SIZE_TO_DOWNLOAD;
    },
    async downloadLazy(fileObj) {
      this.$set(fileObj, 'isDownloading', true);
      const url = `${this.workingDir}/files/${fileObj.name}`;
      let fileContent = null;
      try {
        fileContent = await getFiles(url);
      } catch (notFound) {
        this.$Message.error('Error fetching the file');
        this.$set(fileObj, 'isDownloading', false);
        return;
      }
      this.saveFile(fileContent, fileObj);
    },
    saveFile(content, fileObj) {
      let text = content;
      if (Array.isArray(content)) {
        text = content.join('\n');
      }
      const file = new File([text], fileObj.name, { type: 'text/plain;charset=utf-8' });
      fileSaver.saveAs(file);
      this.$set(fileObj, 'isDownloading', false);
    },
  },
};
</script>


<style>
  .files-container .inline-block {
    display: inline-block;
  }
  .files-container .file-name-size {
    margin-right: 10px;
  }
</style>
