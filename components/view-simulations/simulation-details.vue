<!--
This will display the details of a certain simulation and the analysis.
-->
<template>
    <div class="simulation-details">
        <div v-if="!loading">
            <div class="detail-header">
                <div>
                    <item-summary :itemDetails="simulationDetails"></item-summary>
                    <item-summary :itemDetails="analysisDetails"></item-summary>
                </div>
                <div class="space-flex"></div>
                <a class="button-with-icon colored" @click="returnList"><i class="material-icons">arrow_back</i>Simulation List</a>
                <span class="refresh" @click="refreshJobs" title="Poll manually">
                    <a class="button-with-icon"><i class="material-icons">refresh</i>Reload</a>
                </span>
            </div>
            <div class="detail-content">
                <collapse-title title="Analysis" :collapsed="false">
                    <div slot="element">
                        <analysis :itemDetails="analysisDetails"></analysis>
                    </div>
                </collapse-title>
                <collapse-title title="Files List" :collapsed="false">
                    <div slot="element">
                        <files :itemDetails="simulationDetails" @openFile="openFile"></files>
                    </div>
                </collapse-title>
                <collapse-title title="Logs" :collapsed="true">
                    <div slot="element">
                        <div v-for="log in job.log" class="log-item">
                            {{ log }}
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
                <collapse-title title="Errors" :collapsed="true">
                    <div slot="element" class="log-item">
                        <div v-for="error in simulationDetails.errors">
                            {{ error }}
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
                <collapse-title title="Output" :collapsed="true">
                    <div slot="element" class="log-item">
                        <div v-for="out in simulationDetails.output">
                            {{ out }}
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
            </div>
        </div>
        <div v-else>
        <!-- this will show the erros if the job in not in the selected computer -->
            <div class="detail-content"></div>
        </div>
    </div>
</template>

<script>
import Unicore from 'mixins/unicore.js';
import CollapseTitle from 'components/collapse-title.vue';
import ItemSummary from 'components/view-simulations/simulation-details/item-summary.vue';
import Files from 'components/view-simulations/simulation-details/files.vue';
import Analysis from 'components/view-simulations/simulation-details/analysis.vue';
export default {
    'name': 'simulationDetails',
    'props': ['jobParam', 'jobId', 'computerParam'],
    'data': function() {
        return {
            'loading': true,
            'computer': 'JUQUEEN',
            'unicoreAPI': Unicore,
            'job': null,
            'pollInterval': 10, // seconds
            // add more accesible information to the simulation
            'simulationDetails': {
                // depending of the status change the icon
                'statusIcon': 'check_circle',
                'submissionTime': '',
                'type': 'Simulation',
                'intervalReference': null,
                'autorefresh': true,
                'id': '',
                'name': '',
                'url': '',
                'errors': [],
                'files': '',
                'output': [],
                'filesList': [],
                'status': '',
                'refreshFunction': null,
            },
            'analysisDetails': {
                // depending of the status change the icon
                'statusIcon': 'check_circle',
                'submissionTime': '',
                'type': 'Analysis',
                'intervalReference': null,
                'autorefresh': true,
                'psth': null,
                'id': '',
                'name': '',
                'status': '',
                'refreshFunction': null,
            },
        };
    },
    'components': {
        'collapse-title': CollapseTitle,
        'item-summary': ItemSummary,
        'analysis': Analysis,
        'files': Files,
    },
    'methods': {
        'getErrors': function() {
            let url = this.simulationDetails.files + '/files/stderr';
            this.unicoreAPI.getFiles(url).then((error) => {
                this.simulationDetails.errors = error.split('\n');
            }, console.warn);
        },
        'getFilesList': function() {
            let url = this.simulationDetails.files + '/files';
            this.unicoreAPI.getFilesList(url).then((output) => {
                try {
                    let response = JSON.parse(output);
                    this.simulationDetails.filesList = response.children;
                } catch (e) {
                    console.error('Error parsing files list');
                }
            }, console.warn);
        },
        'getOutputs': function() {
            let url = this.simulationDetails.files + '/files/stdout';
            this.unicoreAPI.getFiles(url).then((output) => {
                this.simulationDetails.output = output.split('\n');
            }, console.warn);
        },
        'getAnalysisInfo': function() {
            /*  get the location of the analysis based on the mapping file
                that we save in the simulation and then the analysis image */
            if (this.job && this.simulationDetails.status === 'SUCCESSFUL') {
                this.unicoreAPI.getAssociatedLocation(this.simulationDetails.files)
                .then((analysisObject) => {
                    this.analysisDetails.id = analysisObject._links.self.href.split('/').pop();
                    this.getAnalysisImage(analysisObject);
                    this.getAnalysisStatus(analysisObject);
                });
            }
        },
        'getAnalysisImage': function(analysisObject) {
            let analysisURL = analysisObject._links.workingDirectory.href;
            this.unicoreAPI.getImage(analysisURL + '/files/psth.png')
            .then((plot) => {
                let reader = new FileReader();
                reader.onloadend = () => {
                    this.$set(this.analysisDetails, 'psth', reader.result);
                };
                reader.readAsDataURL(plot);
            }, (error) => {
                console.log('No analysis image available yet');
            });
        },
        'getAnalysisStatus': function(analysisObject) {
            let analysisURL = analysisObject._links.self.href;
            this.unicoreAPI.getJobProperties(analysisURL)
            .then((jobInfo) => {
                this.analysisDetails.status = jobInfo.status;
                this.analysisDetails.submissionTime = jobInfo.submissionTime;
                this.analysisDetails.name = jobInfo.name;
            });
        },
        'refreshJobs': function() {
            this.getJobById();
        },
        'rejectError': function(error) {
            throw String(error);
        },
        'returnList': function() {
            this.$router.push({
                'name': 'view',
                'params': {
                    'statusSearch': 'all',
                    'computerParam': this.computerParam,
                },
            });
        },
        'toggleAutoreload': function(obj) {
            obj.autorefresh = !obj.autorefresh;
            if (obj.autorefresh) {
                obj.intervalReference = setInterval(() => {
                    if (obj && obj.status === 'SUCCESSFUL') {
                        // stop interval on job finished
                        obj.intervalReference = clearTimeout(obj.intervalReference);
                    } else {
                        obj.refreshFunction();
                    }
                }, this.pollInterval * 1000);
            } else {
                obj.intervalReference = clearTimeout(obj.intervalReference);
            }
        },
        'getJobById': function() {
            // search for the details by id
            this.unicoreAPI.getJobById(this.jobId, this.computer)
            .then((jobDetails) => {
                this.job = jobDetails;
                this.fillJobs(jobDetails);
            }, (error) => {
                let loadingComp = document.getElementById('loading-component');
                if (loadingComp) {
                    loadingComp.style.display = 'none';
                }
                let content = document.querySelector('.detail-content');
                let errorMessage = 'Job not in this computer? Try change the computer from the URL';
                content.innerText = errorMessage;
                console.warn(errorMessage);
            });
        },
        'fillJobs': function(job) {
            this.simulationDetails.url = job._links.self.href;
            this.simulationDetails.status = job.status;
            this.simulationDetails.id = this.simulationDetails.url.split('/').pop();
            this.simulationDetails.name = job.name;
            this.simulationDetails.files = job._links.workingDirectory.href;
            this.simulationDetails.submissionTime = this.job.submissionTime;
            this.loading = false;
            let loadingComp = document.querySelector('#loading-component');
            if (loadingComp) {
                loadingComp.style.display = 'none';
            }
            this.getErrors();
            this.getOutputs();
            this.getAnalysisInfo();
            this.getFilesList();
        },
        'openFile': function(file) {
            let url = this.simulationDetails.files + '/files' + file;
            this.unicoreAPI.getFiles(url).then((output) => {
                let newWindow = window.open('_blank');
                newWindow.document.write(output);
            }, console.warn);
        },
    },
    'created': function() {
        document.getElementById('frameTemplateTitle').innerText = 'Simulation Details';
    },
    'mounted': function() {
        if (this.computerParam) {
            this.computer = this.computerParam;
        };
        if (this.jobParam) {
            this.job = this.jobParam;
            this.fillJobs(this.job);
        }
        if (this.jobParam == null) {
            this.getJobById();
        }
        // poll check. I do the assigment to treat it like first time.
        // Otherwithse the toggle will negate again.
        this.simulationDetails.autorefresh = !this.simulationDetails.autorefresh;
        this.analysisDetails.autorefresh = !this.analysisDetails.autorefresh;
        this.simulationDetails.refreshFunction = this.refreshJobs;
        this.analysisDetails.refreshFunction = this.getAnalysisInfo;
        this.toggleAutoreload(this.simulationDetails);
        this.toggleAutoreload(this.analysisDetails);
    },
    'beforeDestroy': function() {
        clearTimeout(this.simulationDetails.intervalReference);
        clearTimeout(this.analysisDetails.intervalReference);
    },
};
</script>

<style scoped>
    .simulation-details {
        padding: 0 15px;
    }
    a.button-with-icon {
        letter-spacing: .5px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 3px;
        display: flex;
        align-items: center;
    }
    .button-with-icon.colored {
        color: #fff;
        background-color: #879fcb;
    }
    .log-item {
        padding: 10px 0;
        word-break: break-word;
    }
    a.no-link-style.router-link-active {
        text-decoration: none;
    }
    .detail-header {
        padding: 10px 5px;
        display: flex;
        justify-content: space-between;
        align-items: end;
        flex-wrap: wrap;
    }
    .detail-content {
        margin: 0 10px;
    }
    .space-flex {
        flex-grow: 1;
    }
    .button-with-icon i.material-icons {
        margin-right: 5px;
    }
    .item-summary {
        margin-left: 5px;
    }
</style>
<style>
    .spin {
      animation: spin 2s infinite linear;
    }
    @keyframes spin {
      from {transform: rotate(0deg);}
      to {transform: rotate(359deg);}
    }
</style>
