<template>
    <div class="simulation">
        <transition name="fade">
            <div class="app-content" v-if="!loading">
                <div class="title">Run Simulation</div>
                <div class="duration-skip">
                    <span title="Duration">Duration(ms):</span>
                    <input v-model="endTime" type="number" placeholder="Duration" class="form-control">
                    <span title="Run without Stimulus or Report for a given duration using a large timestep. This is to get the cells past any initial transience">ForwardSkip(ms):</span>
                    <input v-model="forwardSkip" type="number" placeholder="Duration" class="form-control">
                </div>
                <div class="border-container">
                    <h2>Stimulations</h2>
                    <div class="subtitle">Defines pattern of stimuli to be injected into multiple locations</div>
                    <stimulation-timeline
                        :endTime="endTime"
                        :forwardSkip="forwardSkip"
                        :blueConfig="blueConfig"></stimulation-timeline>
                </div>
                <div class="border-container">
                    <h2>Reports</h2>
                    <div class="subtitle">Controls data collection during the simulation</div>
                    <report-timeline
                        :endTime="endTime"
                        :forwardSkip="forwardSkip"
                        :blueConfig="blueConfig"></report-timeline>
                </div>
                <a class="button-with-icon" @click="runSimulation">
                    <i class="material-icons">play_arrow</i>Run
                </a>
                <a class="button-with-icon" @click="saveConfig">
                    <i class="material-icons">file_download</i>Save
                </a>
            </div>
        </transition>

    </div>
</template>

<script>

import StimulationTimeline from 'components/stimulation/stimulation-timeline.vue';
import ReportTimeline from 'components/report/report-timeline.vue';
// import blueConfig from 'assets/entity.json';
import CollabAuthentication from 'mixins/collabAuthentication.js';
import Unicore from 'mixins/unicore.js';
const BLUEPY_CONFIG_V0 = 'https://services.humanbrainproject.eu/bluepy/v0/api/blueconfig/';
export default {
    'name': 'simulation',
    'mixins': [CollabAuthentication],
    'data': function() {
        return {
            endTime: 50,
            forwardSkip: null,
            blueConfig: null,
            loading: true,
            unicore: Unicore,
            header: {}
        };
    },
    'components': {
        'stimulation-timeline': StimulationTimeline,
        'report-timeline': ReportTimeline,
    },
    'methods': {
        'saveConfig': function () {
            this.saveCompleteConfig(this.blueConfig)
            .then(function (message) {
                swal('Great!', 'Configuration was saved', 'success');
            }, function (error) {
                swal('Opss', 'Configuration was not saved. ' + error, 'error');
            });
        },
        'runSimulation': function () {
            this.unicore.submitJob(
                'JUQUEEN',
                this.unicore.jobSpec,
                this.unicore.inputs
            )
            .then(function (message) {
                swal('Great!', 'Simulation was started', 'success');
            }, function (error) {
                swal('Opss', 'An error occurred. ' + error, 'error');
            });
        },
        'fillToken': function (renew) {
            let that = this;
            this.getToken(renew).then(function (token) {
                that.header = {headers: {'Authorization': token}};
            }); // from collabAuthentication
        },
        'saveCompleteConfig': function (config) {
            let that = this;
            return new Promise(function (resolve, reject) {
                that.$http.post(BLUEPY_CONFIG_V0 + 'txt/', config, that.header)
                .then(function (response) {
                    if (response.ok) {
                        return resolve('Configuration saved');
                    }
                }, function (error) {
                    if (error.status === 401) {
                        window.localStorage.setItem('blupyconfig', JSON.stringify(config));
                        that.login('none').then(function () {
                            // login in the background
                            that.fillToken();
                        });
                    }
                    let errorBodyParsed = JSON.parse(error.body)
                    if(error.body && errorBodyParsed) {
                        reject('Error saving bluepyconfig: ' + errorBodyParsed.message);
                    } else {
                        reject('Error saving bluepyconfig: ' + error);
                    }
                });
            });
        },
        'loadCompleteConfig': function () {
            let that = this;
            return new Promise(function (resolve, reject) {
                let url = BLUEPY_CONFIG_V0 + '41c6c0f6-a590-4a99-bb8c-30b6668b49bd';
                that.$http.get(url, that.header)
                .then(function (response) {
                    return resolve(response.body);
                }, function (error) {
                    if (error.status === 401) {
                        that.fillToken(true);
                    }
                    console.log(error);
                    reject('Error loading bluepyconfig: ' + error);
                });
            });
        },
        'loadLocalConfig': function () {
            return Promise.resolve(require('assets/entity.json'));
        }
    },
    'mounted': function() {
        let that = this;
        this.login().then(function () {  // from CollabAuthentication
            that.fillToken();
            that.loadLocalConfig().then(function (bluepyConfig) {
                that.blueConfig = bluepyConfig;
                document.querySelector('#loading-component').remove();
                that.endTime = that.blueConfig.Run.Default.Duration;
                that.forwardSkip = that.blueConfig.Run.Default.ForwardSkip;
                that.loading = false;
            });
        }, function (error) {
            console.error(error);
            that.loading = false;
        });
    },
    'watch': {
        'endTime': function (newVal) {
            this.blueConfig.Run.Default.Duration = parseFloat(newVal);
        },
        'forwardSkip': function (newVal) {
            this.blueConfig.Run.Default.ForwardSkip = parseFloat(newVal);
        }
    }
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
    padding-top: 8px;
    padding-bottom: 8px;
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
.title {
    box-shadow: 0 2px 5px rgba(0,0,0,.26);
    color: #fff;
    background-color: rgba(172,96,103,.95);
    padding: 20px;
    font-size: 24px;
    width: 100%;
    margin-bottom: 20px;
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
</style>
