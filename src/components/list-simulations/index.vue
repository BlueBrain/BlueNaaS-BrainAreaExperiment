
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
import unicore from '@/services/unicore';
import analysisConfig from '@/config/analysis-config';
import LaunchAnalysisForm from '@/components/list-simulations/launch-analysis-form.vue';
import analysisHelper from '@/services/helper/analysis-helper';
import listJobsHelper from '@/services/helper/list-jobs-helper';
import eventBus from '@/services/event-bus';
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal.vue';
import ChunkRequester from '@/services/helper/chunk-requester';
import { getComputerProjectCombo } from '@/common/utils';
import sortBy from 'lodash/sortBy';
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
      jobSelectedForAnalysis: null,
      isRunningAnalysis: false,
      originalCombo: null,
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
    eventBus.$on('reloadJobsList', this.reloadJobsListBinded);

    eventBus.$on('applyFilters', () => {
      const filtered = this.applyFiltersToSims(this.allSimulations);
      this.viewList = sortBy(filtered, 'submissionTime').reverse();
    });

    if (this.$route.params.computerParam) {
      eventBus.$emit(
        'changeComputer',
        this.$route.params.computerParam,
        () => eventBus.$emit('reloadJobsList'),
      );
    } else {
      eventBus.$emit('reloadJobsList');
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

    reloadJobsListBinded() {
      this.viewList = [];
      this.allSimulations = [];
      this.$nextTick(() => {
        this.fetchJobs().catch(error => this.$Message.error(error.message));
      });
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
        try {
          await unicore.deleteJob(url);
        } catch (error) {
          console.error(error);
          this.$Message.error(`Could not delete the job ${error.message}`);
          return;
        }
        removeFromList();
        this.$Message.info('Simulation was deleted');
      });
    },

    showDetails(job) {
      const id = job.id || unicore.urlToComputerAndId(job._links.self.href);
      this.$router.push({
        name: 'details',
        params: {
          jobId: id,
          computerParam: this.$store.state.currentComputer,
        },
      });
    },

    runAnalysis(job) {
      this.showAnalysisForm = true;
      // set the origin computer details
      this.jobSelectedForAnalysis = job;
      // after the form will return to analysisConfigReady
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

      this.isRunningAnalysis = false; // form should be closed
      this.showAnalysisForm = false;
      this.showDetails(this.jobSelectedForAnalysis);
    },

    fetchAnalysis() {
      // start fetching analysis
      this.$store.commit('setAnalysisListIsLoading', true);
      const fetchFn = listJobsHelper.fetchAnalysisInfo;
      let chunkAnalysisRequester = null;
      const callbackFn = (analysisAndStatusObj) => {
        if (this.originalCombo !== getComputerProjectCombo()) {
          chunkAnalysisRequester.cancelFetching();
          return;
        }
        this.$set(
          analysisAndStatusObj.simulationWithFiles,
          'analysisStatus',
          analysisAndStatusObj.newAnalysisStatus,
        );
      };

      chunkAnalysisRequester = new ChunkRequester(fetchFn, callbackFn);
      chunkAnalysisRequester.setOnFinishFn(() => {
        this.$store.dispatch('hideLoader');
        this.$store.commit('setAnalysisListIsLoading', false);
      });
      chunkAnalysisRequester.addJobs(this.viewList);
    },

    async fetchJobs() {
      // to avoid saving jobs in the wrong computer
      this.$store.commit('setListIsLoading', true);

      // this will be used to check if the computer or page changed
      this.originalCombo = getComputerProjectCombo();

      const listToFetch = await listJobsHelper.getUrlList();
      const allJobWithFiles = [];

      const fetchFn = unicore.populateJobsWithFiles;
      let chunkSimulationRequester = null;
      const callbackFn = (jobWithFiles) => {
        if (this.originalCombo !== getComputerProjectCombo()) {
          chunkSimulationRequester.cancelFetching();
          return;
        }
        allJobWithFiles.push(jobWithFiles);
        const [simulation] = listJobsHelper.filterOnlySimulations([jobWithFiles]);
        if (!simulation) return;
        this.allSimulations.push(simulation);
        const [filteredSimulation] = this.applyFiltersToSims([simulation]);
        this.viewList.push(filteredSimulation);
        // if job is running poll the status
        listJobsHelper.startReloadJob(simulation, getComputerProjectCombo());
      };

      chunkSimulationRequester = new ChunkRequester(fetchFn, callbackFn);
      chunkSimulationRequester.setOnFinishFn(() => {
        this.viewList = sortBy(this.viewList, 'submissionTime').reverse();
        // save full list of all jobs sorted for compare next time
        listJobsHelper.saveFullJobList(allJobWithFiles);
        this.$store.commit('setListIsLoading', false);
        this.fetchAnalysis();
      });
      chunkSimulationRequester.addJobs(listToFetch);
    },
  },
  beforeDestroy() {
    eventBus.$off('reloadJobsList', this.reloadJobsListBinded);
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
