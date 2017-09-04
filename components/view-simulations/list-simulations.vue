<!--
This will get the information related to each job and pass the data to simulation-item.
This component manage each job (delete, start, create, etc).
-->
<template>
    <div class="list-simulations">
        <div class="filter">
            <span>
                <a
                    @click="resetFilter"
                    class="button-with-icon filter-icon"
                    :class="{'filter-on': filterOn}"
                    :title="filterStatus">
                    <i class="material-icons">filter_list</i>
                    Filter
                </a>
            </span>
            <span>
                <a class="button-with-icon" title="Filter by Name or ID"><i class="material-icons">fingerprint</i></a>
            </span>
            <input class="input-style" type="text" v-model="nameFilter">
            <span>
            <a class="button-with-icon" title="Status"><i class="material-icons">check_circle</i></a>
            </span>
            <select class="input-style" v-model="statusFilter">
                <option value="ALL">ALL</option>
                <option value="SUCCESSFUL">SUCCESSFUL</option>
                <option value="FAILED">FAILED</option>
                <option value="READY">READY</option>
                <option value="QUEUED">QUEUED</option>
                <option value="RUNNING">RUNNING</option>
            </select>
            <span>
            <a class="button-with-icon" title="Supercomputer to be used"><i class="material-icons">dns</i></a>
            </span>
            <select class="input-style" v-model="computerFilter">
                <option value="JUQUEEN">JUQUEEN</option>
                <option value="JURECA">JURECA</option>
                <option value="JULIA">JULIA</option>
            </select>
            <span class="space-flex"></span>
            <router-link to="/" class="create-simulation-button">
                <a class="button-with-icon colored"><i class="material-icons">add</i>Create Simulation</a>
            </router-link>
            <span class="refresh" @click="refreshJobs">
                <a class="button-with-icon"><i class="material-icons">refresh</i>Reload</a>
            </span>
        </div>
        <div class="table-header">
            <span class="id">Name</span>
            <span class="status">Simulation Step</span>
            <span class="status">Analysis Step</span>
            <span class="time">Submission Date</span>
        </div>
        <div v-if="!loading" class="simulation-items-container">
            <simulation-item
                v-for="job in viewList"
                :key="job._links.self.href"
                :job="job"
                @actionJob="actionJob"
                @deleteJob="deleteJob"
                @showDetails="showDetails(job, computerFilter)"
                @runAnalysis="runAnalysis(job)">
            </simulation-item>

            <infinite-loading
                :on-infinite="onInfinite"
                ref="infiniteLoading">
                <span slot="no-more"></span>
                <span slot="no-results"></span>
            </infinite-loading>
        </div>
        <!-- template for configuration -->
        <table id="configTemplate" class="config-template" style="display:none">
            <span class="subtitle">Copy files and run analysis</span>
            <tr>
                <th>Title:</th>
                <th>
                    <input type="text" name="" class="title" :value="moveObject.title">
                </th>
            </tr>
            <tr>
                <th>Origin:</th>
                <th>{{ moveObject.from.computer }}</th>
            </tr>
            <tr>
                <th>Destination: </th>
                <th>{{ moveObject.to.computer }}</th>
            </tr>
            <tr>
                <th>Nodes: </th>
                <th>
                    <input type="number" name="" class="nodes" :value="moveObject.nodes">
                </th>
            </tr>
        </table>
        <!-- END template for configuration -->
    </div>
</template>

<script>
    import SimulationItem from 'components/view-simulations/simulation-item.vue';
    import InfiniteLoading from 'vue-infinite-loading';
    import Unicore from 'mixins/unicore.js';
    export default {
        'name': 'list_simulations',
        'components': {
            'simulation-item': SimulationItem,
            'infinite-loading': InfiniteLoading,
        },
        'props': ['computerParam', 'statusSearch'],
        'data': function() {
            return {
                'loading': true,
                'computerFilter': 'JUQUEEN',
                'moveObject': {
                    'from': {
                        'workingDirectory': null,
                        'computer': 'JUQUEEN',
                    },
                    'to': {
                        'workingDirectory': null, // create a new one
                        'computer': 'JURECA',
                    },
                    'files': ['out.dat', 'BlueConfig'],
                    'nodes': 1,
                    'title': '',
                },
                'unicoreAPI': Unicore,
                'jobs': [],
                'filteredObjects': [],
                'viewList': [],
                'readObjectIndex': 0,
                'loadIncrement': 10,
                'statusFilter': 'ALL',
                'nameFilter': '',
                'dateFilter': '',
                'filterOn': false,
                'pollInterval': 10,
            };
        },
        'computed': {
            'filterStatus': function() {
                if (this.filterOn) {
                    return 'Filter is activated';
                }
            },
        },
        'methods': {
            'actionJob': function(actions) {
                this.unicoreAPI.actionJob(actions.url);
                swal('Great!', actions.text, 'success');
            },
            'checkFilterIcon': function() {
                if (this.nameFilter === '' && this.statusFilter === 'ALL') {
                    this.filterOn = false;
                } else {
                    this.filterOn = true;
                }
            },
            'filter': function() {
                let filteredByStatus = [];
                if (this.statusFilter === 'ALL') {
                    filteredByStatus = this.jobs;
                }
                this.jobs.map((job) => {
                    // filter items first by status
                    if (job.status === this.statusFilter) {
                        filteredByStatus.push(job);
                    }
                });

                let filteredById = [];
                // used filtered status to continue filtering by id
                filteredByStatus.map((job) => {
                    let name = job.name.toUpperCase();
                    if (name.search(this.nameFilter.toUpperCase()) !== -1) {
                        filteredById.push(job);
                    }
                });

                // set color to the filter if there is one
                this.checkFilterIcon();
                // sort by date
                this.readObjectIndex = this.loadIncrement;
                filteredById.sort((a, b) => {
                    if (a.submissionTime > b.submissionTime) return -1;
                    return 1;
                });
                this.filteredObjects = filteredById;
                // put items in the view
                this.viewList = filteredById.slice(0, this.loadIncrement);
                this.loading = false;
                // reset inifiteloading so it checks the next time if there are more items
                this.$nextTick(() => { // wait until the infinite component is loaded
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
                    // TODO: add id in as parameter (in general it will be "")
                    this.$router.replace({
                        'name': 'view',
                        'params': {
                            'computerParam': this.computerFilter,
                            'statusSearch': this.statusFilter,
                        },
                    });
                });
            },
            'getAnalysisInfo': function(simulationJob) {
                /*  get the location of the analysis based on the mapping file
                    that we save in the simulation and then the validation image */
                if (simulationJob.status === 'SUCCESSFUL') {
                    this.unicoreAPI.getAssociatedLocation(simulationJob._links.workingDirectory.href)
                    .then((analysisObject) => {
                        this.getStatus(analysisObject, simulationJob);
                    }, (error) => { // stop loading status. analysis not run yet.
                        this.$set(simulationJob, 'analysisStatus', undefined);
                    });
                } else {
                    this.$set(simulationJob, 'analysisStatus', 'BLOCK');
                }
            },
            'getStatus': function(analysisObject, simulationJob) {
                let analysisURL = analysisObject._links.self.href;
                this.unicoreAPI.getJobProperties(analysisURL)
                .then((jobInfo) => {
                    // $set because of Caveats
                    this.$set(simulationJob, 'analysisStatus', jobInfo.status);
                });
            },
            'removeFromList': function(url) {
                this.jobs.map((job, index, arr) => {
                    if (job._links.self.href === url) {
                        this.jobs.splice(index, 1);
                        return;
                    }
                });
                this.filter();
            },
            'deleteJob': function(url) {
                swal({
                    'title': 'Are you sure?',
                    'text': 'You won\'t be able to revert this!',
                    'type': 'warning',
                    'showCancelButton': true,
                    'focusCancel': true,
                    'confirmButtonColor': '#ac6067',
                    'cancelButtonColor': '#879fcb',
                    'confirmButtonText': 'Yes, delete it!',
                }).then(() => {
                    this.unicoreAPI.deleteJob(url)
                    .then(() => {
                        swal(
                            'Deleted!',
                            'Your job has been deleted.',
                            'success'
                        );
                        this.removeFromList(url);
                    });
                });
            },
            'showDetails': function(job, computer) {
                let url = job._links.self.href;
                let id = url.substr(url.lastIndexOf('/') + 1);
                this.$router.push({'name': 'details', 'params': {
                    'jobId': id,
                    'jobParam': job,
                    'computerParam': computer,
                }});
            },
            'refreshJobs': function() {
                this.loading = true;
                let loadingComp = document.getElementById('loading-component');
                if (loadingComp && loadingComp.style.display === 'none') {
                    loadingComp.style.display = 'block';
                }
                this.jobs = [];
                this.unicoreAPI.getAllJobs(this.computerFilter)
                .then((response) => {
                    let jobs = response.jobs;
                    let jobPropertiesArray = [];
                    for (let i = 0; i < jobs.length; i++) {
                        let job = jobs[i];
                        jobPropertiesArray.push(this.unicoreAPI.getJobProperties(job));
                    }
                    Promise.all(jobPropertiesArray).then((resultsArray) => {
                        // I need to wait to all so I can sort them by date.
                        // TODO: ask for the API to obtain by date.
                        // get the analysis information async
                        resultsArray.map((simulationJob) => {
                            // add this so the item shows sync icon
                            simulationJob['analysisStatus'] = 'LOADING';
                            this.getAnalysisInfo(simulationJob);
                        });
                        this.filteredObjects = this.jobs = resultsArray;
                        this.filter();
                        if (loadingComp) {
                            this.$nextTick(() => {
                                loadingComp.style.display = 'none';
                            });
                        }
                    });
                });
            },
            'resetFilter': function() {
                this.nameFilter = '';
                this.statusFilter = 'ALL';
            },
            'runAnalysis': function(job) {
                // TOOD: avoid hardcoding computers
                let that = this;
                this.moveObject.from.workingDirectory = job._links.workingDirectory.href;
                swal({
                    'title': 'Run analysis',
                    'html': that.showSimulationParameters(),
                    'showCancelButton': true,
                    'confirmButtonText': 'Submit',
                    'confirmButtonColor': '#548d68',
                    'cancelButtonColor': '#ac6067',
                    'showLoaderOnConfirm': true,
                    'allowOutsideClick': true,
                    'preConfirm': function() {
                        return that.setupSelectedConfig(that.moveObject);
                    },
                }).then(function(analysis) {
                    let startURL = analysis.destinationJob._links['action:start'].href;
                    console.log('starting analysis...');
                    that.unicoreAPI.actionJob(startURL);
                    // pool the status of the analysis
                    that.startReloadJob(job);
                    swal({
                        'title': 'Analysis started!',
                        'text': 'Analysis results can take a long time',
                        'showCancelButton': true,
                        'cancelButtonText': 'View Job',
                        'type': 'success',
                    }).then(function() {}, function() {
                        that.showDetails(job, that.moveObject.from.computer);
                    });
                }).catch(swal.noop);
            },
            'onInfinite': function() {
                if (this.loading) return; // avoid processing things while loading
                if (this.readObjectIndex > this.filteredObjects.length) {
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                    return;
                }
                let newItems = [];
                // obtain the next elements
                newItems = this.filteredObjects.slice(this.readObjectIndex, this.readObjectIndex + this.loadIncrement);
                this.readObjectIndex += this.loadIncrement;
                this.viewList = this.viewList.concat(newItems);
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
            },
            'showSimulationParameters': function() {
                // create a copy of the template for get the params later
                // due Swal library creates the HTML without vuejs.
                let configTemplate = document.getElementById('configTemplate').cloneNode(true);
                configTemplate.id = 'configTemplateFilled';
                configTemplate.style.display = 'block';
                return configTemplate;
            },
            'setupSelectedConfig': function(moveObject) {
                // get the parameters based on the user's configuration
                let configTemplateFilled = document.getElementById('configTemplateFilled');
                let getParam = function(name) {
                    return configTemplateFilled.querySelector('.' + name).value;
                };
                moveObject.nodes = getParam('nodes');
                moveObject.title = getParam('title');
                return this.unicoreAPI.submitAnalysis(moveObject);
            },
            'startReloadJob': function(simulationJob) {
                let poolAnalysis = function(simulationJob) {
                    if (simulationJob.autorefresh) {
                        simulationJob.intervalReference = setInterval(() => {
                            if (simulationJob && simulationJob.analysisStatus === 'SUCCESSFUL') {
                                // stop interval on job finished
                                simulationJob.intervalReference = clearTimeout(simulationJob.intervalReference);
                            } else {
                                this.getAnalysisInfo.call(this, simulationJob);
                            }
                        }, this.pollInterval * 1000);
                    } else {
                        simulationJob.intervalReference = clearTimeout(simulationJob.intervalReference);
                    }
                };
                simulationJob['autorefresh'] = true;
                simulationJob['intervalReference'] = null;
                // add this status to show the sync
                simulationJob['analysisStatus'] = 'LOADING';
                poolAnalysis.call(this, simulationJob);
            },
        },
        'mounted': function() {
            if (this.statusSearch) {
                this.statusFilter = this.statusSearch.toUpperCase();
                this.checkFilterIcon();
            }
            this.computerFilter = this.computerParam.toUpperCase();
            this.refreshJobs();
        },
        'watch': {
            'statusFilter': function() {
                if (!this.loading) {
                    this.filter();
                }
            },
            'nameFilter': function() {
                if (!this.loading) {
                    this.filter();
                }
            },
            'computerFilter': function() {
                if (!this.loading) {
                    this.refreshJobs();
                }
            },
        },
    };
</script>

<style scoped>
    .list-simulations {
        padding: 0 15px;
    }
    .table-header {
        display: flex;
        padding: 5px 15px;
        font-weight: bold;
        font-size: 20px;
        margin: 0 5px;
        border-radius: 5px;
        border: 1px solid;
    }
    .table-header span.id {
        width: 37%;
        text-align: center;
    }
    .table-header span.status {
        width: 18%;
    }
    .table-header span.time {
        width: 32%;
        text-align: end;
    }
    .filter {
        padding: 10px 5px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    .space-flex {
        flex-grow: 1;
    }
    a.button-with-icon {
        letter-spacing: .5px;
        display: flex;
        cursor: pointer;
        align-items: center;
        margin: 0 10px;
    }
    a.button-with-icon.colored {
        color: #fff;
        background-color: #879fcb;
        padding: 5px 10px;
        border-radius: 3px;
        margin: 0;
    }
    a.create-simulation-button.router-link-active {
        text-decoration: none;
    }
    .filter-icon {
        border-radius: 5px;
        padding: 5px;
    }
    .filter-icon.filter-on {
        background-color: red;
        color: white;
    }
    .input-style {
        height: 33px;
        width: 130px;
        margin: 0px 0;
        display: inline-block;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 3px #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        padding: 9px 15px;
    }
    .config-template {
        text-align: left;
        margin: 0 23%;
    }
    .config-template .subtitle {
        padding: 10px;
        display: block;
    }
    .config-template th {
        padding-left: 10px;
    }
    .config-template input {
        border-radius: 4px;
        border-style: groove;
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