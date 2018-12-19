
<!--
This will get the information related to each job and pass the data to simulation-item.
This component manage each job (delete, start, create, etc).
-->
<template>
  <div class="list-simulations">

    <div class="table-header">
      <span class="name">Name</span>
      <span class="simulated status">Simulated</span>
      <span class="analyzed status">Analyzed</span>
      <span class="time">Submission Date</span>
      <span class="actions">Actions</span>
    </div>

    <div
      class="simulation-items-container"
      v-if="!listIsLoading"
    >
      <simulation-item
        class="item-row"
        v-for="job in viewList"
        :key="job.id"
        :job="job"
        @deleteJob="deleteJob"
        @showDetails="showDetails(job)"
        @runAnalysis="runAnalysis(job)"
      />

      <div
        v-if="emptyList"
        class="really-centered colored-red"
      >List of jobs is empty</div>

      <infinite-loading
        @infinite="onInfinite"
        :identifier="infiniteId"
      >
        <span slot="no-more"/>
        <span slot="no-results"/>
      </infinite-loading>
    </div>
    <!-- template for configuration -->
    <launch-analysis-form
      :show-modal="showAnalysisForm"
      :job-selected-for-analysis="jobSelectedForAnalysis"
      :is-running-analysis="isRunningAnalysis"
      @changeModalVisibility="toggleModal"
      @analysisConfigReady="analysisConfigReady"
    />

    <delete-confirmation-modal ref="deletionModal"/>

  </div>
</template>


<script>
import SimulationItem from '@/components/list-simulations/simulation-item.vue';
import InfiniteLoading from 'vue-infinite-loading';
import unicore, { urlToComputerAndId } from '@/services/unicore';
import analysisConfig from '@/assets/analysis-config';
import LaunchAnalysisForm from '@/components/list-simulations/launch-analysis-form.vue';
import analysisHelper from '@/services/helper/analysis-helper';
import { jobStatus, isRunning } from '@/assets/job-status';
import eventBus from '@/services/event-bus';
import db from '@/services/db';
import visualizationConfig from '@/assets/visualization-config';
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal.vue';

export default {
  name: 'ListSimulations',
  components: {
    SimulationItem,
    InfiniteLoading,
    LaunchAnalysisForm,
    DeleteConfirmationModal,
  },
  props: ['statusSearch', 'nameFilter'],
  data() {
    return {
      showAnalysisForm: false,
      filteredSimulations: [],
      jobs: [],
      viewList: [],
      readObjectIndex: 0,
      loadIncrement: 20,
      jobSelectedForAnalysis: null,
      isRunningAnalysis: false,
      infiniteId: +new Date(),
    };
  },
  computed: {
    listIsLoading() {
      return this.$store.state.listIsLoading;
    },
    emptyList() {
      const isEmpty = (this.$store.state.currentComputer === this.$route.params.computerParam) &&
        !this.$store.state.listIsLoading && !this.viewList.length;

      return isEmpty;
    },
  },
  mounted() {
    eventBus.$on('reloadJobsList', () => {
      this.fetchJobs();
    });
    eventBus.$on('applyFilters', () => {
      this.filter(this.jobs);
    });
    eventBus.$on('cleanList', () => {
      this.viewList = [];
    });

    if (!this.$store.state.currentComputer && this.$route.params.computerParam) {
      eventBus.$emit('changeComputer', this.$route.params.computerParam, this.fetchJobs);
    } else {
      this.fetchJobs();
    }
  },
  methods: {
    toggleModal(value) {
      if (value) {
        this.showAnalysisForm = value;
        return;
      }
      this.showAnalysisForm = !this.showAnalysisForm;
    },

    filter(simulations) {
      this.filteredSimulations = simulations;
      if (this.statusSearch !== 'ALL') {
        this.filteredSimulations = this.filteredSimulations.filter(job => (
          job.status === this.statusSearch
        ));
      }
      if (this.nameFilter) {
        this.filteredSimulations = this.filteredSimulations.filter(job => (
          job.name.toUpperCase().includes(this.nameFilter.toUpperCase())
        ));
      }

      this.readObjectIndex = 0;
      // sort by date
      this.filteredSimulations.sort((a, b) => {
        if (a.submissionTime > b.submissionTime) return -1;
        return 1;
      });

      // put items in the view
      this.viewList = this.filteredSimulations.slice(this.readObjectIndex, this.loadIncrement);
      this.readObjectIndex += this.loadIncrement;
    },

    deleteJob(url) {
      const that = this;
      function removeFromList() {
        that.jobs.forEach((job, index) => {
          if (job._links.self.href === url) {
            that.jobs.splice(index, 1);
          }
        });
        that.filter(that.jobs);
      }

      this.$refs.deletionModal.changeVisibility();
      this.$refs.deletionModal.setDeleteFn(async () => {
        await unicore.deleteJob(url);
        removeFromList();
        this.$Message.info('Simulation was deleted');
      });
    },

    showDetails(job) {
      const id = job.id || urlToComputerAndId(job._links.self.href);
      this.$router.push({
        name: 'details',
        params: {
          jobId: id,
          computerParam: this.$store.state.currentComputer,
        },
      });
    },

    async fetchJobs() {
      console.debug('Fetching jobs for list');
      this.$store.commit('setListIsLoading', true);

      const filterOnlySimulations = ((jobsWithFiles) => {
        // return job information and a list of files as children []
        // hack in case you want to see all the jobs not only simulation from one computer
        const displayEverything = localStorage.getItem('displayAll') === 'true';

        return jobsWithFiles.filter((simulationExpandedInfo) => {
          if (displayEverything) {
            console.warn('using displayAll flag');
            return true;
          }
          const updatedSimulation = simulationExpandedInfo;

          if (updatedSimulation.isSimulation) return true;
          if (updatedSimulation.isAnalysis) return false;
          if (updatedSimulation.isVisualization) return false;
          // when add a new condition remember to add also into getAllJobsExpandedWithChildren
          if (updatedSimulation.children.length === 0) return false;

          let result = false;
          // filter to only show simulations
          if (updatedSimulation.children.includes(`/${analysisConfig.configFileName}`)) {
            // it is an analysis that should be removed
            updatedSimulation.isAnalysis = true;
            result = false;
          } else if (updatedSimulation.name.startsWith(visualizationConfig.jobNamePrefix)) {
            // is viz
            updatedSimulation.isVisualization = true;
            // result = false;
          } else {
            // is sim
            // simulation without
            updatedSimulation.isSimulation = true;
            if (
              !updatedSimulation.children.includes('/out.dat') &&
              updatedSimulation.status === jobStatus.successful
            ) {
              // do not produce any output file - simulation failed
              updatedSimulation.status = jobStatus.failed;
            }
            result = true;
          }
          // Poll data while running
          if (isRunning(updatedSimulation.status)) {
            this.startReloadJob(updatedSimulation);
          }
          db.addJob(updatedSimulation);
          return result;
        });
      });

      try {
        const jobsWithFiles = await unicore.getAllJobsExpandedWithChildren(this.$store.state.currentComputer);
        console.log('Total jobs:', jobsWithFiles.length);
        const simulations = filterOnlySimulations(jobsWithFiles);
        console.log('Filtered simulations', simulations.length);
        this.jobs = simulations.map(this.fetchAnalysisInfo);
        this.filter(this.jobs);
        this.$store.commit('setListIsLoading', false);
        this.$store.dispatch('hideLoader');
      } catch (e) {
        this.$Message.error(`Error ${e.message}`);
        console.error('getAllJobsExpandedWithChildren', e);
      }
    },

    fetchAnalysisInfo(simulationListWithFiles) {
      const that = this;
      async function fetchAnalysisJob(updatedSimulation) {
        /*
         * get the location of the analysis based on the mapping file
         * that we save in the simulation and then the validation image
         */
        const analysisArray = await unicore.getAssociatedLocation(
          analysisConfig.analysisConnectionFileName,
          updatedSimulation._links.workingDirectory.href,
        );

        let status = null;
        if (analysisArray.length > 0) {
          const url = analysisArray[analysisArray.length - 1]._links.self.href;
          const lastAnalysisInfo = await unicore.getJobProperties(url);
          status = lastAnalysisInfo ? lastAnalysisInfo.status : null;
        }
        // change the status after async function
        that.$set(updatedSimulation, 'analysisStatus', status);
      }

      const updatedSimulation = simulationListWithFiles;

      if (simulationListWithFiles.status === jobStatus.successful) {
        updatedSimulation.analysisStatus = jobStatus.loading;
        fetchAnalysisJob(updatedSimulation);
      } else {
        updatedSimulation.analysisStatus = jobStatus.block;
      }
      return updatedSimulation;
    },

    runAnalysis(job) {
      this.showAnalysisForm = true;
      // set the origin computer details
      this.jobSelectedForAnalysis = job;
      // after the form will return to analysisConfigReady
    },

    onInfinite($state) {
      if (this.listIsLoading) return;
      if (this.readObjectIndex > this.filteredSimulations.length) {
        $state.complete();
        return;
      }
      let newItems = [];
      // obtain the next elements
      newItems = this.filteredSimulations.slice(
        this.readObjectIndex,
        this.readObjectIndex + this.loadIncrement,
      );
      this.readObjectIndex += this.loadIncrement;
      this.viewList = this.viewList.concat(newItems);
      $state.loaded();
    },

    async startReloadJob(simulationJob) {
      console.debug('Polling info for:', simulationJob.name);
      const updatedSimJob = await unicore.getJobProperties(simulationJob._links.self.href);
      if (isRunning(simulationJob.status)) {
        setTimeout(this.startReloadJob, this.$store.state.pollInterval, updatedSimJob);
      }
    },

    async analysisConfigReady(analysisParamsEdited) {
      this.isRunningAnalysis = true;

      const newAnalysisParamsEdited = analysisParamsEdited;
      newAnalysisParamsEdited.from.workingDirectory = this.jobSelectedForAnalysis._links.workingDirectory.href;
      console.debug('Submiting analysis...');

      const { script } = analysisConfig[this.$store.state.currentComputer];

      await analysisHelper.submitAnalysis(
        newAnalysisParamsEdited,
        script,
        analysisConfig.filesToAvoidCopy,
      );

      // poll the status of the analysis
      this.$set(this.jobSelectedForAnalysis, 'analysisStatus', jobStatus.loading);

      this.isRunningAnalysis = false; // form should be closed
      this.showAnalysisForm = false;
      this.showDetails(this.jobSelectedForAnalysis);
    },
  },
};
</script>


<style scoped lang="scss">
  .table-header {
    display: flex;
    padding: 0 5px;
    font-weight: bold;
    font-size: 14px;
    border-radius: 3px;
    border: 1px solid;
    justify-content: space-evenly;

    span {
      text-align: center;
      &.name {
        text-align: left;
        padding-left: 5px;
        width: 35%;
      }
      &.status {
        width: 10%;
      }
      &.time {
        width: 20%;
      }
      &.actions {
        width: 25%;
      }
    }

  }
  .item-row {
    padding: 2px 0;
    border-bottom-style: ridge;
    border-bottom-width: 1px;
    border-bottom-color: #d8d8d8;
    &:hover {
      background-color: #e2e3e3;
    }
  }

  .really-centered {
    padding: 20px;
    text-align: center;
  }

  .colored-red {
    color: #770a0a;
  }
</style>
