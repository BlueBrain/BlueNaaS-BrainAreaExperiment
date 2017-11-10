<template>
    <div class="simulation">
        <transition name="fade">
            <div class="app-content" v-if="!loading">
                <!-- header params -->
                <div class="duration-skip">
                    <span title="Time length of stimulus duration, given in milliseconds(ms)">Duration(ms):</span>
                    <input v-model="endTime" type="number" min="0" placeholder="Duration" class="form-control" @blur="checkNegative">
                    <span title="Run without Stimulus or Report for a given duration using a large timestep. This is to get the cells past any initial transience">ForwardSkip(ms):</span>
                    <input v-model="forwardSkip" type="number" min="0" placeholder="Duration" class="form-control" @blur="checkNegative">
                    <span id="errors" class="errors" v-show="errors">{{errors}}</span>
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
                    <div class="row">
                        <stimulation-timeline
                            :endTime="endTime"
                            :forwardSkip="forwardSkip"
                            ref="stimulation"
                            class="timeline"></stimulation-timeline>
                        <target-selection @targetSelected="stimulationTargetSelected"></target-selection>
                    </div>
                </div>
                <!-- END stimulation timeline -->

                <!-- report timeline -->
                <div class="border-container">
                    <h2>Reports</h2>
                    <div class="subtitle">Controls data collection during the simulation</div>
                    <div class="row">
                        <report-timeline
                            :endTime="endTime"
                            :forwardSkip="forwardSkip"
                            ref="report"
                            class="report"></report-timeline>
                        <target-selection @targetSelected="reportTargetSelected"></target-selection>
                    </div>
                </div>
                <!-- END report timeline -->
                <div class="footer">
                    <div class="tip">You can scroll in the timeline to zoom in/out</div>
                    <a class="button-with-icon" @click="runSimulation">
                        <i class="material-icons">play_arrow</i>Run
                    </a>
                </div>
            </div>
        </transition>
        <!-- template for configuration -->
        <table id="configTemplate" class="config-template" style="display: none;">
            <!-- be carefull cause when the popup in swal2 is open the vue models are not related anymore
            so add the functionality in showSimulationParameters -->
             <tr>
                <th>Title: </th>
                <th>
                    <input type="text" name="Title of the Job" class="title" :value="runConfig.title" placeholder="Job's title">
                </th>
             </tr>
             <tr>
                <th>Computer: </th>
                <th>
                    <select class="computer" title="Supercomputer" v-model="runConfig.computer">
                        <option v-for="resources in runConfig.computersAvailable" :value="resources">{{ resources }}</option>
                    </select>
                </th>
            </tr>
            <tr>
                <th>Project: </th>
                <th>
                    <input type="text" name="Project to be used" class="project" :value="runConfig.project" placeholder="Optional">
                </th>
             </tr>
             <tr>
                 <th>Nodes: </th>
                 <th>
                    <input type="number" name="Number of computer resources" class="nodes" :value="runConfig.nodes" placeholder="Node to allocate">
                 </th>
             </tr>
             <tr>
                 <th>RunTime: </th>
                 <th>
                    <input type="number" name="Time until timeout" class="runtime" :value="runConfig.runtime" placeholder="Time before timeout">
                 </th>
             </tr>
             <tr>
                <div class="preview-config">Preview Config</div>
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
import TargetSelection from 'components/target-selection/target-selection.vue';
export default {
    'name': 'run_simulation',
    'mixins': [CollabAuthentication],
    'data': function() {
        return {
            'endTime': 50,
            'errors': '',
            'forwardSkip': null,
            'blueConfig': null,
            'loading': true,
            'unicore': Unicore,
            'header': {},
            'runConfig': {
                'title': '',
                'computer': 'JUQUEEN',
                'computersAvailable': ['JUQUEEN', 'JURECA', 'JULIA'],
                'applicationName': 'Bash shell',
                'nodes': 1024,
                'runtime': 86400,
                'project': '',
            },
        };
    },
    'components': {
        'stimulation-timeline': StimulationTimeline,
        'report-timeline': ReportTimeline,
        'target-selection': TargetSelection,
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
            this.createConfig();
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
                    'title': 'Simulation started!',
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
            let that = this;
            // timeout because it was not attached to dom
            setTimeout(function() {
                document.querySelector('#configTemplateFilled .preview-config').onclick = that.previewConfig;
            }, 500);
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
            this.runConfig.project = getParam('project');
            this.runConfig.computer = getParam('computer');
            this.runConfig.runtime = getParam('runtime');
            let params = this.unicore.getConfig(this.runConfig, this.blueConfig, null);
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
        'stimulationTargetSelected': function(target) {
            // an event in stimulation-timeline will be called
            this.$emit('stimulationTargetSelected', target);
        },
        'reportTargetSelected': function(target) {
            // an event in report-timeline will be called
            this.$emit('reportTargetSelected', target);
        },
        'createConfig': function() {
            // modify the config object respectively
            this.$refs.stimulation.createConfig(this.blueConfig);
            this.$refs.report.createConfig(this.blueConfig);
        },
        'previewConfig': function() {
            let myjson = JSON.stringify(this.blueConfig, null, 2);
            let x = window.open();
            x.document.open();
            x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
            x.document.close();
        },
        'checkNegative': function(event) {
            if (event.target.value < 0) {
                this.errors = 'Duration and ForwardSkip should be possitive';
            } else {
                this.errors = '';
            }
        },
    },
    'mounted': function() {
        document.getElementById('frameTemplateTitle').innerText = 'Configure & Launch Simulations';
        let that = this;
        that.loadLocalConfig().then(function(bluepyConfig) {
            that.blueConfig = bluepyConfig;
            let loadingComp = document.querySelector('#loading-component');
            if (loadingComp) {
                loadingComp.style.display = 'none';
            }
            that.endTime = that.blueConfig.Run.Default.Duration;
            that.forwardSkip = that.blueConfig.Run.Default.ForwardSkip;
            that.loading = false;
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
    .config-template input {
        border-radius: 4px;
        border-style: groove;
    }
    .config-template .computer {
        min-width: 120px;
    }
    .config-template > tr {
        display: inline-flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;
    }
    .row {
        display: flex;
    }
    .timeline, .report {
        flex-grow: 1;
    }
    .preview-config {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-style: solid;
        border-radius: 15px;
        border-width: 1px;
        padding: 5px 0;
    }
    .config-template tr {
        min-height: 40px;
    }
    .errors {
        background-color: #f81b00;
        color: white;
        padding: 5px;
        border-radius: 5px;
    }
    .footer {
        display: flex;
        justify-content: space-between;
    }
    .footer .tip {
        color: #879fcb;
        padding: 5px 10px;
        margin: 30px 15px 30px 10px;
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
