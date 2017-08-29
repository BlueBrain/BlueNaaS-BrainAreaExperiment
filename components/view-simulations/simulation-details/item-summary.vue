<template>
    <div class="item-summary">
        <div class="column">
            <div class="top">
                <span class="type">{{ itemDetails.type }}:</span>
                <span class="name" v-if="itemDetails.name">{{ itemDetails.name }}</span>
                <span class="name" v-else> Not available </span>
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
                <a class="button-with-icon" title="Auto Refresh" @click="toggleAutoreload">
                    <i class="material-icons" :class="{spin : itemDetails.intervalReference}">autorenew</i>
                    {{ simulationAutorefreshString }}
                </a>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        'name': 'item-summary',
        'props': ['itemDetails'],
        'methods': {
            'toggleAutoreload': function() {
                this.$emit('toggleAutoreload', this.itemDetails);
            },
        },
        'computed': {
            'date': function() {
                let rawDate = new Date(this.itemDetails.submissionTime);
                return rawDate.toLocaleString();
            },
            'simulationAutorefreshString': function() {
                return (this.itemDetails.autorefresh ? 'ON' : 'OFF');
            },
            'analysisAutorefreshString': function() {
                return (this.itemDetails.autorefresh ? 'ON' : 'OFF');
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
    .column .id {
        width: 335px;
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