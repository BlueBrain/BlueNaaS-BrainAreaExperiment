
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

    <transition-group
      name="list"
      tag="div"
      class="simulation-items-container"
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
        :key="emptyList"
        class="really-centered colored-red"
      >List of jobs is empty</div>

    </transition-group>

    <!-- template for configuration -->
    <launch-analysis-form
      :show-modal="showAnalysisForm"
      :job-selected-for-analysis="jobSelectedForAnalysis"
      :is-running-analysis="isRunningAnalysis"
      @changeModalVisibility="toggleModal"
      @analysis-config-ready="analysisConfigReady"
    />

    <delete-confirmation-modal ref="deletionModal"/>

  </div>
</template>


<script>
import SimulationItem from '@/components/list-simulations/simulation-item.vue';
import InfiniteLoading from 'vue-infinite-loading';
import unicore, { urlToComputerAndId } from '@/services/unicore';
import analysisConfig from '@/config/analysis-config';
import LaunchAnalysisForm from '@/components/list-simulations/launch-analysis-form.vue';
import analysisHelper from '@/services/helper/analysis-helper';
import { jobStatus, isRunning } from '@/common/job-status';
import eventBus from '@/services/event-bus';
import db from '@/services/db';
import visualizationConfig from '@/config/visualization-config';
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal.vue';
import chunk from 'lodash/chunk';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import remove from 'lodash/remove';

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
      allSimulations: [],
      viewList: [],
      loadIncrement: 5,
      jobSelectedForAnalysis: null,
      isRunningAnalysis: false,
      pageIsDisplayed: true,
    };
  },
  computed: {
    listIsLoading() {
      return this.$store.state.listIsLoading;
    },
    emptyList() {
      const isEmpty = (this.$store.state.currentComputer === this.$route.params.computerParam)
        && !this.$store.state.listIsLoading && !this.viewList.length;
      return isEmpty;
    },
  },
  mounted() {
    eventBus.$on('reloadJobsList', () => {
      this.fetchJobs();
    });
    eventBus.$on('applyFilters', () => {
      const filtered = this.applyFiltersToSims(this.allSimulations);
      this.viewList = sortBy(filtered, 'submissionTime').reverse();
    });
    eventBus.$on('cleanList', () => {
      this.viewList = [];
      this.allSimulations = [];
    });

    this.$store.commit('setListIsLoading', true);

    if (this.$route.params.computerParam) {
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

    applyFiltersToSims(simulations) {
      // let filteredSimulations = simulations;
      const filteredSimulations = simulations
        .filter(job => (this.statusSearch !== 'ALL' ? job.status === this.statusSearch : true))
        .filter(job => (this.nameFilter ? job.name.toUpperCase().includes(this.nameFilter.toUpperCase()) : true));
      // put items in the view
      return filteredSimulations;
    },

    deleteJob(url) {
      const removeFromList = () => {
        remove(this.viewList, job => job._links.self.href === url);
        // https://github.com/lodash/lodash/issues/2965 [reactive issue]
        this.viewList = this.applyFiltersToSims(this.viewList);
        remove(this.allSimulations, job => job._links.self.href === url);
      };

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
      this.$store.commit('setListIsLoading', true);

      const displayEverything = localStorage.getItem('displayAll') === 'true';
      if (displayEverything) { this.$Message.info('Using displayAll flag'); }

      const filterOnlySimulations = (jobsWithFiles =>
        // return job information and a list of files as children []
        // hack in case you want to see all the jobs not only simulation from one computer
        jobsWithFiles.filter((simulationExpandedInfo) => {
          if (displayEverything) {
            return true;
          }
          const updatedSimulation = simulationExpandedInfo;

          if (updatedSimulation.isSimulation) return true;
          if (updatedSimulation.isAnalysis) return false;
          if (updatedSimulation.isVisualization) return false;
          // when add a new condition remember to add also into getAllJobsExpandedWithChildren
          if (updatedSimulation.children.length === 0) return false;

          let result = false;
          // filter to only show simulations on the list
          if (updatedSimulation.children.includes(`/${analysisConfig.configFileName}`)) {
            // it is an analysis that should be removed
            updatedSimulation.isAnalysis = true;
            result = false;
          } else if (updatedSimulation.name.startsWith(visualizationConfig.jobNamePrefix)) {
            updatedSimulation.isVisualization = true;
          } else {
            updatedSimulation.isSimulation = true;
            if (
              !updatedSimulation.children.includes('/out.dat')
              && updatedSimulation.status === jobStatus.successful
            ) {
              // do not produce any output file - simulation failed
              updatedSimulation.status = jobStatus.failed;
            }
            result = true;
          }
          // Poll data while running
          if (isRunning(updatedSimulation.status)) {
            const computerProjectCombo = `${this.$store.state.currentComputer}${this.$store.state.userGroup}`;
            this.startReloadJob(updatedSimulation, computerProjectCombo);
          }
          db.addJob(updatedSimulation);
          return result;
        })
      );

      const fetchJobsInChunks = (async (jobsToPopulate) => {
        let jobsWithFiles = [];
        try {
          jobsWithFiles = await unicore.populateJobsWithFiles(jobsToPopulate);
        } catch (e) {
          const message = `expanding jobs with file info. ${e.message}`;
          this.$Message.error(message);
          throw new Error(message);
        }
        return jobsWithFiles;
      });

      let allJobsUrl = [];
      let allJobWithFiles = [];

      try {
        allJobsUrl = await unicore.getAllJobs(this.$store.state.currentComputer);
      } catch (e) {
        const message = `getting all jobs for list. ${e.message}`;
        this.$Message.error(message);
        throw new Error(message);
      }

      // compare saved list and sorted list
      const savedAllJobUrl = await db.getAllJobsSortedList();
      // sorting with lodash to avoid mutation
      const listToFetch = (savedAllJobUrl && isEqual(sortBy(allJobsUrl), sortBy(savedAllJobUrl)))
        ? savedAllJobUrl
        : allJobsUrl;

      const chunksJobsUrlArrays = chunk(listToFetch, this.loadIncrement);
      // load chunks in secuence
      for (let i = 0; i < chunksJobsUrlArrays.length; i += 1) {
        const chunkJobsUrl = chunksJobsUrlArrays[i];
        /* eslint-disable no-await-in-loop */
        const jobsWithFiles = await fetchJobsInChunks(chunkJobsUrl);
        /* eslint-enable no-await-in-loop */
        const simulations = filterOnlySimulations(jobsWithFiles);
        this.allSimulations = this.allSimulations.concat(simulations);
        const filteredSimulations = this.applyFiltersToSims(simulations);
        this.viewList = this.viewList.concat(filteredSimulations);
        // save for use after to save the list on localstorage
        allJobWithFiles = allJobWithFiles.concat(jobsWithFiles);
      }

      this.viewList = sortBy(this.viewList, 'submissionTime').reverse();

      // save full list of all jobs sorted
      const sortedAllJobWithFiles = sortBy(allJobWithFiles, 'submissionTime').reverse();
      const sortedJobsUrlToSave = sortedAllJobWithFiles.map(jobPopulated => jobPopulated._links.self.href);
      if (!savedAllJobUrl || !isEqual(sortBy(sortedJobsUrlToSave), sortBy(savedAllJobUrl))) {
        db.setAllJobsSortedList(sortedJobsUrlToSave);
      }

      this.viewList.map(this.fetchAnalysisInfo);
      this.$store.commit('setListIsLoading', false);
      this.$store.dispatch('hideLoader');
    },

    fetchAnalysisInfo(simulationListWithFiles) {
      const fetchAnalysisJob = async (updatedSimulation) => {
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
        // change the status after fetching analysis info
        this.$set(updatedSimulation, 'analysisStatus', status);
      };

      let newAnalysisStatus = jobStatus.block;
      if (simulationListWithFiles.status === jobStatus.successful) {
        fetchAnalysisJob(simulationListWithFiles);
        newAnalysisStatus = jobStatus.loading;
      }
      this.$set(simulationListWithFiles, 'analysisStatus', newAnalysisStatus);
      return simulationListWithFiles;
    },

    runAnalysis(job) {
      this.showAnalysisForm = true;
      // set the origin computer details
      this.jobSelectedForAnalysis = job;
      // after the form will return to analysisConfigReady
    },

    async startReloadJob(simulationJob, prevComputerProjectCombo) {
      // when move to other page, cancel the refresh
      const computerProjectCombo = `${this.$store.state.currentComputer}${this.$store.state.userGroup}`;
      if (!this.pageIsDisplayed || prevComputerProjectCombo !== computerProjectCombo) return;
      const updatedSimJob = await unicore.getJobProperties(simulationJob._links.self.href);
      if (isRunning(simulationJob.status)) {
        setTimeout(this.startReloadJob, this.$store.state.pollInterval, updatedSimJob, computerProjectCombo);
      }
    },

    async analysisConfigReady(analysisParamsEdited) {
      this.isRunningAnalysis = true;

      const newAnalysisParamsEdited = analysisParamsEdited;
      newAnalysisParamsEdited.from.workingDirectory = this.jobSelectedForAnalysis._links.workingDirectory.href;

      const config = analysisConfig[this.$store.state.currentComputer];
      if (!config || (!config.script && !config.executable)) {
        this.$Message.error('Error launching analysis');
      }

      await analysisHelper.submitAnalysis(
        newAnalysisParamsEdited,
        config.script,
        analysisConfig.filesToAvoidCopy,
      );

      // poll the status of the analysis
      this.$set(this.jobSelectedForAnalysis, 'analysisStatus', jobStatus.loading);

      this.isRunningAnalysis = false; // form should be closed
      this.showAnalysisForm = false;
      this.showDetails(this.jobSelectedForAnalysis);
    },
  },
  beforeDestroy() {
    // stop refreshing the simulations that are running
    this.pageIsDisplayed = false;
  },
};
</script>


<style scoped lang="scss">
  .list-enter-active, .list-leave-active {
    transition: all 0.3s;
  }
  .list-enter, .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
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
