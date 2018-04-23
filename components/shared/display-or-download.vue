<template>
  <div class="display-download">
    <i v-if="showText()">
      <div v-for="log in fileContent" class="log-item">
        <div v-if="typeof(log) === 'object'">
          <div v-for="logItem in log" class="indent">
            {{ logItem }}
          </div>
        </div>
        <div v-else>
          {{log}}
        </div>
      </div>
    </i>

    <a v-show="isLoadingObj[name]"
      class="button-with-icon" title="Loading">
        <i class="material-icons spin">autorenew</i>
    </a>
    <a v-show="!isLoadingObj[name]" @click="saveFile()"
      class="button-with-icon colored">
      <i class="material-icons download-file">file_download</i>
      Download File
    </a>
  </div>
</template>
<script>
  import utils from 'assets/utils.js';
  export default {
    'name': 'display-or-download',
    'props': ['name', 'fileContent', 'isLoadingObj'],
    'methods': {
      'showText': function() {
        if (this.fileContent && this.fileContent.length < 10000) {
          if (this.fileContent.length === 1 && this.fileContent[0] === '') {
            this.fileContent = ['NO FILE CONTENT FOUND'];
          }
          return true;
        }
        return false;
      },
      'saveFile': function() {
        utils.save(this.name, this.fileContent);
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
  .spin {
    animation: spin 2s infinite linear;
  }
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
</style>
