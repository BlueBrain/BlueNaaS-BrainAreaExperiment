<!--
This will display the details of a certain job.
-->
<template>
    <div class="simulation-details">
        <div v-if="!loading">
            <div class="detail-header">
                <a class="button-with-icon" title="ID"><i class="material-icons">fingerprint</i>
                    {{ jobdetais.id }}
                </a>
                <div class="space-flex"></div>
                <a class="button-with-icon colored" @click="returnList"><i class="material-icons">arrow_back</i>Simulation List</a>
                <span class="refresh" @click="refreshJobs" title="Poll manually">
                    <a class="button-with-icon"><i class="material-icons">refresh</i>Reload</a>
                </span>
            </div>
            <div class="row">
                <a class="button-with-icon" title="Status">
                    <i class="material-icons">
                    {{ statusIcon }}</i>
                    {{ job.status }}
                </a>
                <a class="button-with-icon" title="Submission Time">
                    <i class="material-icons">watch_later</i>
                    {{ date }}
                </a>
                <a class="button-with-icon" title="Auto Refresh" @click="toggleAutoreload">
                    <i class="material-icons" :class="{spin : intervalObject}">autorenew</i>
                    {{ autorefreshString }}
                </a>
            </div>
            <div class="detail-content">
                <collapse-title title="Files List" :collapsed="false">
                    <div slot="element">
                        <div v-for="file in jobdetais.filesList" class="file-item">
                            {{ file }}
                        </div>
                        <a class="button-with-icon" v-if="intervalObject" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
                <collapse-title title="Logs" :collapsed="true">
                    <div slot="element">
                        <div v-for="log in job.log" class="log-item">
                            {{ log }}
                        </div>
                        <a class="button-with-icon" v-if="intervalObject" title="Loading">
                            <i class="material-icons">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
                <collapse-title title="Errors" :collapsed="true">
                    <div slot="element" class="log-item">
                        <div v-for="error in jobdetais.errors">
                            {{ error }}
                        </div>
                        <a class="button-with-icon" v-if="intervalObject" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
                <collapse-title title="Output" :collapsed="true">
                    <div slot="element" class="log-item">
                        <div v-for="out in jobdetais.output">
                            {{ out }}
                        </div>
                        <a class="button-with-icon" v-if="intervalObject" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                    </div>
                </collapse-title>
                <collapse-title title="Plots" :collapsed="false">
                    <div slot="element">
                        <img class="validation-plot" :src="jobdetais.plot">
                        <a class="button-with-icon" v-if="intervalObject" title="Loading">
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
export default {
    'name': 'simulationDetails',
    'props': ['jobParam', 'jobId', 'computerParam'],
    'data': function() {
        return {
            'loading': true,
            'computer': 'JUQUEEN',
            'unicoreAPI': Unicore,
            // depending of the status change the icon
            'statusIcon': 'check_circle',
            'job': null,
            'autorefresh': true,
            'pollInterval': 10, // seconds
            'intervalObject': null, // used to stop the interval
            // add more accesible information to the job
            'jobdetais': {
                'id': '',
                'url': '',
                'errors': [],
                'files': '',
                'output': [],
                'filesList': [],
                'plot': '',
            },
        };
    },
    'components': {
        'collapse-title': CollapseTitle,
        'frame-template': 'FrameTemplate',
    },
    'methods': {
        'getErrors': function() {
            let url = this.jobdetais.files + '/files/stderr';
            this.unicoreAPI.getFiles(url).then((error) => {
                this.jobdetais.errors = error.split('\n');
            }, console.warn);
        },
        'getFilesList': function() {
            let url = this.jobdetais.files + '/files';
            this.unicoreAPI.getFilesList(url).then((output) => {
                try {
                    let response = JSON.parse(output);
                    this.jobdetais.filesList = response.children;
                } catch (e) {
                    console.error('Error parsing files list');
                }
            }, console.warn);
        },
        'getOutputs': function() {
            let url = this.jobdetais.files + '/files/stdout';
            this.unicoreAPI.getFiles(url).then((output) => {
                this.jobdetais.output = output.split('\n');
            }, console.warn);
        },
        'getStatusIcon': function() {
            if (this.job.status === 'FAILED') {
                this.statusIcon = 'cancel';
            }
        },
        'getValidation': function() {
            /*  get the location of the validation based on the mapping file
                that we save in the simulation and then the validation image */
            if (this.job && this.job.status === 'SUCCESSFUL') {
                let url = this.jobdetais.files + '/files/validation_path';
                this.unicoreAPI.getFiles(url)
                .then((output) => {
                    try {
                        let validationObject = JSON.parse(output);
                        let validationURL = validationObject._links.workingDirectory.href;
                        return this.unicoreAPI.getImage(validationURL + '/files/psth.png');
                    } catch (e) {
                        throw new Error('No validation file. Images cannot be shown');
                    }
                }, console.warn)
                .then((plot) => {
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        this.jobdetais.plot = reader.result;
                    };
                    reader.readAsDataURL(plot);
                }, console.warn);
            }
        },
        'refreshJobs': function() {
            this.getJobById();
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
        'toggleAutoreload': function() {
            this.autorefresh = !this.autorefresh;
            if (this.autorefresh) {
                this.intervalObject = setInterval(() => {
                    if (this.job && this.job.status === 'SUCCESSFUL') {
                        // stop interval on job finished
                        this.intervalObject = clearTimeout(this.intervalObject);
                    }
                    this.refreshJobs();
                }, this.pollInterval * 1000);
            } else {
                this.intervalObject = clearTimeout(this.intervalObject);
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
            this.jobdetais.url = job._links.self.href;
            this.jobdetais.id = this.jobdetais.url.split('/').pop();
            this.jobdetais.files = job._links.workingDirectory.href;
            this.loading = false;
            let loadingComp = document.querySelector('#loading-component');
            if (loadingComp) {
                loadingComp.style.display = 'none';
            }
            this.getErrors();
            this.getOutputs();
            this.getStatusIcon();
            this.getValidation();
            this.getFilesList();
        },
    },
    'computed': {
        'date': function() {
            let rawDate = new Date(this.job.submissionTime);
            return rawDate.toLocaleString();
        },
        'autorefreshString': function() {
            return (this.autorefresh ? 'ON' : 'OFF');
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
        this.autorefresh = !this.autorefresh;
        this.toggleAutoreload();
    },
    'beforeDestroy': function() {
        clearTimeout(this.intervalObject);
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
        align-items: center;
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
    .row {
        display: flex;
        margin-left: 5px;
    }
    .spin {
      animation: spin 2s infinite linear;
    }
    @keyframes spin {
      from {transform: rotate(0deg);}
      to {transform: rotate(359deg);}
    }
    .validation-plot {
        width: 400px;
        height: 400px;
    }
    .file-item {
        padding: 0 5px;
        display: inline;
    }
</style>
