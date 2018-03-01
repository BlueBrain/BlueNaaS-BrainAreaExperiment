<template>
    <div class="item-summary">
        <div class="column">
            <div class="top">
                <span class="type">{{ itemDetails.type }}:</span>
                <span class="name" v-if="itemDetails.name">{{ itemDetails.name }}</span>
                <span class="name" v-else> Not available yet </span>
            </div>
            <div class="bottom" v-if="itemDetails.id">
                <a class="button-with-icon id" title="ID"><i class="material-icons">fingerprint</i>
                    {{ itemDetails.id}}
                </a>
                <a class="button-with-icon status" title="Status">
                    <i class="material-icons">
                    {{ getStatusIcon }}</i>
                    {{ itemDetails.status }}
                </a>
                <a class="button-with-icon date" title="Submission Time">
                    <i class="material-icons">watch_later</i>
                    {{ date }}
                </a>
                <span>
                    <slot></slot>
                </span>
            </div>
        </div>
    </div>
</template>
<script>
    import utils from 'assets/utils.js';
    export default {
      'name': 'item-summary',
      'props': ['itemDetails'],
      'computed': {
        'date': function() {
          return utils.getDateLocalTime(this.itemDetails.submissionTime);
        },
        'getStatusIcon': function() {
          if (this.itemDetails.status === 'FAILED') {
            return 'cancel';
          }
          return this.itemDetails.statusIcon;
        },
      },
    };
</script>
<style scoped>
    .column {
        display: flex;
        margin-left: 5px;
        flex-wrap: wrap;
        flex-direction: column;
    }
    .column > * {
        margin: 5px 10px;
    }
    .column .bottom > * {
        margin-right: 10px;
    }
    .column .type {
        min-width: 100px;
        font-weight: bold;
        font-size: 20px;
        display: inline-block;
    }
    .column .name {
        margin-left: 10px;
    }
    .column .status {
        min-width: 135px;
    }
    .column .date {
        min-width: 185px;
    }
    .material-icons {
        vertical-align: middle;
    }
    .bottom > * {
        display: inline-block;
    }
</style>