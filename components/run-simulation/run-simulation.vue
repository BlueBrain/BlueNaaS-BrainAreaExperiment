<template>
    <div class="simulation">
        <transition name="fade">
            <div class="app-content" v-if="!loading">
                <!-- header params -->
                <div class="duration-skip">
                    <span title="Duration">Duration(ms):</span>
                    <input v-model="endTime" type="number" placeholder="Duration" class="form-control">
                    <span title="Run without Stimulus or Report for a given duration using a large timestep. This is to get the cells past any initial transience">ForwardSkip(ms):</span>
                    <input v-model="forwardSkip" type="number" placeholder="Duration" class="form-control">
                    <span class="right-margin">
                        <a class="button-with-icon" @click="viewList">
                            <i class="material-icons">list</i>View Simulations
                        </a>
                    </span>
                </div>
                <!-- END header params -->
                <!-- stimulation timeline -->
                <div class="border-container">
                    <h2>Stimulations</h2>
                    <div class="subtitle">Defines pattern of stimuli to be injected into multiple locations</div>
                    <stimulation-timeline
                        :endTime="endTime"
                        :forwardSkip="forwardSkip"
                        :blueConfig="blueConfig"></stimulation-timeline>
                </div>
                <!-- END stimulation timeline -->
                <!-- report timeline -->
                <div class="border-container">
                    <h2>Reports</h2>
                    <div class="subtitle">Controls data collection during the simulation</div>
                    <report-timeline
                        :endTime="endTime"
                        :forwardSkip="forwardSkip"
                        :blueConfig="blueConfig"></report-timeline>
                </div>
                <!-- END report timeline -->
                <a class="button-with-icon" @click="runSimulation">
                    <i class="material-icons">play_arrow</i>Run
                </a>
            </div>
        </transition>
        <!-- template for configuration -->
        <table id="configTemplate" class="config-template" style="display:none">
            <tr>
                <th>Title: </th>
                <th>
                    <input type="text" title="Title for the job" class="title" :value="runConfig.title">
                </th>
            </tr>
            <tr>
                <th>Computer: </th>
                <th>{{ runConfig.computer }}</th>
            </tr>
            <tr>
                <th>Nodes: </th>
                <th>
                    <input type="number" name="" class="nodes" :value="runConfig.nodes">
                </th>
            </tr>
        </table>
        <!-- END template for configuration -->
    </div>
</template>

<script>

import StimulationTimeline from 'components/run-simulation/stimulation/stimulation-timeline.vue';
import ReportTimeline from 'components/run-simulation/report/report-timeline.vue';
import CollabAuthentication from 'mixins/collabAuthentication.js';
import Unicore from 'mixins/unicore.js';
export default {
    'name': 'run_simulation',
    'mixins': [CollabAuthentication],
    'data': function() {
        return {
            'endTime': 50,
            'forwardSkip': null,
            'blueConfig': null,
            'loading': true,
            'unicore': Unicore,
            'header': {},
            'runConfig': {
                'title': '',
                'computer': 'JUQUEEN',
                'applicationName': 'BSP',
                'nodes': 32,
            },
        };
    },
    'components': {
        'stimulation-timeline': StimulationTimeline,
        'report-timeline': ReportTimeline,
    },
    'methods': {
        'saveConfig': function() {
            this.saveCompleteConfig(this.blueConfig)
            .then(function(message) {
                swal('Great!', 'Configuration was saved', 'success');
            }, function(error) {
                swal('Opss', 'Configuration was not saved. ' + error, 'error');
            });
        },
        'runSimulation': function() {
            let that = this;
            swal({
                'title': 'Are you sure?',
                'html': that.showSimulationParameters(),
                'showCancelButton': true,
                'confirmButtonText': 'Submit',
                'confirmButtonColor': '#548d68',
                'cancelButtonColor': '#ac6067',
                'showLoaderOnConfirm': true,
                'allowOutsideClick': true,
                'preConfirm': function() {
                    return that.setupSelectedConfig();
                },
            }).then(function(jobObject) {
                let id = jobObject._links.self.href.split('/').pop();
                console.log('starting job...');
                that.unicore.actionJob(jobObject._links['action:start'].href);
                swal({
                    'title': 'Simulaiton started!',
                    'showCancelButton': true,
                    'cancelButtonText': 'View Job',
                    'type': 'success',
                }).then(function() {}, function() {
                    that.$router.push({
                        'name': 'details',
                        'params': {
                            'jobId': id,
                            'computerParam': that.runConfig.computer,
                        },
                    });
                });
            });
        },
        'showSimulationParameters': function() {
            // create a copy of the template for get the params later
            // due Swal library creates the HTML without vuejs.
            let configTemplate = document.getElementById('configTemplate').cloneNode(true);
            configTemplate.id = 'configTemplateFilled';
            configTemplate.style.display = 'block';
            return configTemplate;
        },
        'fillToken': function(renew) {
            let that = this;
            this.getToken(renew).then(function(token) {
                that.header = {'headers': {'Authorization': token}};
            }); // from collabAuthentication
        },
        'loadLocalConfig': function() {
            return Promise.resolve(require('assets/entity.json'));
        },
        'setupSelectedConfig': function() {
            // get the parameters based on the user's configuration
            let configTemplateFilled = document.getElementById('configTemplateFilled');
            let getParam = function(name) {
                return configTemplateFilled.querySelector('.' + name).value;
            };
            this.runConfig.nodes = getParam('nodes');
            this.runConfig.title = getParam('title');
            let params = this.unicore.getConfig(
                this.runConfig.applicationName,
                this.runConfig.title,
                this.runConfig.nodes,
                this.blueConfig,
                null
            );
            return this.unicore.submitJob(
                this.runConfig.computer,
                params.jobSpec,
                params.inputs
            );
        },
        'viewList': function() {
            this.$router.push({
                'name': 'view',
                'params': {
                    'computerParam': this.runConfig.computer,
                    'statusSearch': 'ALL',
                },
            });
        },
    },
    'mounted': function() {
        document.getElementById('frameTemplateTitle').innerText = 'Run Simulation';
        let that = this;
        this.login().then(function() { // from CollabAuthentication
            that.fillToken();
            that.loadLocalConfig().then(function(bluepyConfig) {
                that.blueConfig = bluepyConfig;
                let loadingComp = document.querySelector('#loading-component');
                if (loadingComp) {
                    loadingComp.style.display = 'none';
                }
                that.endTime = that.blueConfig.Run.Default.Duration;
                that.forwardSkip = that.blueConfig.Run.Default.ForwardSkip;
                that.loading = false;
            });
        }, function(error) {
            console.error(error);
            that.loading = false;
        });
    },
    'watch': {
        'endTime': function(newVal) {
            this.blueConfig.Run.Default.Duration = parseFloat(newVal);
        },
        'forwardSkip': function(newVal) {
            this.blueConfig.Run.Default.ForwardSkip = parseFloat(newVal);
        },
    },
};
</script>

<style scoped>
    a.button-with-icon {
        color: #fff;
        background-color: #879fcb;
        letter-spacing: .5px;
        cursor: pointer;
        padding: 5px 10px;
        margin: 30px 15px 30px 0;
        border-radius: 3px;
        display: flex;
        align-items: center;
        float: right;
    }
    .duration-skip {
        padding: 10px 5px;
    }
    .duration-skip input {
        width: 100px;
        margin: 0px 0;
        display: inline-block;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 3px #ddd;
        border-radius: 4px;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 9px;
        padding-bottom: 9px;
    }
    .duration-skip span {
        margin-left: 15px;
    }
    .simulation h2 {
        width: 100%;
        background-color: transparent;
        margin: 0 0 0 0;
        border-radius: 3px;
        font-size: 26px;
    }
    .border-container {
        background-color: rgba(216, 223, 239, 0.38);
        border-radius: 5px;
        padding: 20px 10px;
        margin: 30px 15px 0 15px;
    }
    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s
    }
    .fade-enter, .fade-leave-to {
      opacity: 0
    }
    .right-margin a {
        margin: 0 15px 0 0;
    }
    .app-content .duration-skip + .border-container {
        /* the first block simulation */
        margin-top: 10px;
    }
    .config-template {
        margin: 0 23%;
    }
</style>

<style>
    /* disable the bounce effect sweetalerts*/
    @-webkit-keyframes showSweetAlert {
        0% {
            -webkit-transform: scale(0.7);
            transform: scale(0.7);
        }

        100% {
            -webkit-transform: scale(1);
            transform: scale(1);
        }
    }
    @keyframes showSweetAlert {
        0% {
            -webkit-transform: scale(0.7);
            transform: scale(0.7);
        }

        100% {
            -webkit-transform: scale(1);
            transform: scale(1);
        }
    }
    .swal2-content td, .swal2-content th {
        /*border: 1px solid #dddddd;*/
        text-align: left;
        padding: 8px;
    }
    .swal2-content table {
        margin: 0 auto;
    }
</style>
