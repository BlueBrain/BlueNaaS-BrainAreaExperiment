<!--
This will only display the item. It knows where to put all the information.
-->
<template>
    <div class="simulation-item" @click="itemSelected">
        <div class="left-part clickable">
            <div class="id clickable">
                {{job.name}}
            </div>
            <div class="details-button">
                <a class="button-with-icon clickable" title="See Simulation details"><i class="material-icons">zoom_in</i>Details</a>
            </div>
        </div>
        <!-- simulation status icon -->
        <div class="middle-part clickable simulation">
            <i
                v-if="job.noOut"
                class="material-icons colored"
                title="No results produced"
            >
                warning
            </i>
            <i  class="material-icons colored"
                :title="getStatusString(job.status)">
                {{ getStatusIcon(job.status) }}</i>
        </div>
        <!-- analysis status icon -->
        <div class="middle-part clickable analysis">
            <i  class="material-icons colored"  v-if="!showAnalysisButton"
                :title="getStatusString(job.analysisStatus)">
                {{ getStatusIcon(job.analysisStatus) }}</i>
            <a @click="runAnalysis" v-else class="button-with-icon analysis" :class="{available: !analysisAlreadyDone}" title="Start analysis"><i class="material-icons">play_arrow</i>Start</a>
        </div>
        <div class="right-part clickable">
            <div class="column clickable">
                <div class="date">{{getDate}}</div>
                <div class="inline-flex">
                    <a @click="deleteJob" class="button-with-icon danger" title="Delete job forever"><i class="material-icons">delete_forever</i>Delete</a>
                    <a @click="runAnalysis" v-if="analysisDone" class="button-with-icon analysis available" title="Start analysis"><i class="material-icons">play_arrow</i>Analysis</a>
                    <a @click="abortJob" class="button-with-icon" title="Cancel Job"><i class="material-icons">cancel</i>Abort</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const BLOCK_STATUS = 'BLOCK';
const SUCCESSFUL_STATUS = 'SUCCESSFUL';
const FAILED_STATUS = 'FAILED';
export default {
    'name': 'simulationItem',
    'props': ['job'],
    'methods': {
        'runAnalysis': function() {
            this.$emit('runAnalysis');
        },
        'abortJob': function() {
            let actionURL = this.job._links.self.href + '/actions/abort';
            this.$emit('actionJob', {'url': actionURL, 'text': 'Job Aborted'});
        },
        'deleteJob': function() {
            let url = this.job._links.self.href;
            this.$emit('deleteJob', url);
        },
        'itemSelected': function(event) {
            // check if the id for example is not selected so we can copy it.
            if (event.target.classList.contains('clickable') &&
                window.getSelection().toString() === '') {
                this.$emit('showDetails', this.job);
            }
        },
        'getStatusIcon': function(status) {
            switch (status) {
            case SUCCESSFUL_STATUS:
                return 'check_box';
                break;
            case FAILED_STATUS:
                return 'error';
                break;
            case BLOCK_STATUS:
                return 'block';
                break;
            default: // if is RUNNING, QUEUE, etc
                return 'sync';
                break;
            }
        },
        'getStatusString': function(status) {
            if (!status || status === BLOCK_STATUS) {
                return 'Waiting for simulation ends';
            }
            return status;
        },
    },
    'computed': {
        'getId': function() {
            let url = this.job._links.self.href;
            if (this.job._links && url) {
                return url.substr(url.lastIndexOf('/') + 1);
            }
        },
        'getDate': function() {
            let stringDate = this.job.submissionTime;
            if (stringDate) {
                return new Date(this.job.submissionTime).toLocaleString();
            }
        },
        'analysisDone': function() {
            return (this.job.analysisStatus === SUCCESSFUL_STATUS ? true : false);
        },
        'showAnalysisButton': function() {
            return (this.job.analysisStatus == null ? true : false);
        },
    },
};
</script>

<style scoped>
    .simulation-item {
        display: flex;
        border-radius: 5px;
        justify-content: space-between;
        padding: 5px;
        margin: 5px;
        background-color: rgba(216, 223, 239, 0.38);
    }
    .left-part {
        width: 40%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .middle-part {
        width: 20%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .middle-part.simulation {
        border-left: solid lightgray;
        border-right: solid lightgray;
    }
    .middle-part.analysis {
        border-right: solid lightgray;
    }
    .right-part {
        width: 40%;
        display: flex;
        align-items: flex-end;
        flex-direction: column;
    }
    .right-part .inline-flex {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
    a.button-with-icon {
        color: #fff;
        background-color: #879fcb;
        letter-spacing: .5px;
        cursor: pointer;
        padding: 5px 10px;
        margin: 5px 5px;
        border-radius: 3px;
        display: flex;
        align-items: center;
    }
    a.button-with-icon.danger {
        background-color: rgb(172, 96, 103);
    }
    a.button-with-icon.analysis {
        background-color: #548d68;
        opacity: 0.3;
    }
    a.button-with-icon.analysis.available {
        opacity: 1;
    }
    .material-icons.colored {
        color: rgb(172, 96, 103);
    }
    .material-icons.colored[title='SUCCESSFUL'] {
        color: green;
    }
    .column {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
    .date {
        text-align: right;
        padding-right: 10px;
    }
</style>
