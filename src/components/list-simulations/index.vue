
<!--
This will get the information related to each job and pass the data to simulation-item.
This component manage each job (delete, start, create, etc).
-->
<template>
  <div class="list-simulations">

    <div class="table-header">
      <span class="name">Title</span>
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
        @delete-job="deleteJob"
        @show-details="showDetails(job)"
        @run-analysis="runAnalysis(job)"
      />
    </transition-group>

    <div
      v-if="!viewList.length && !listIsLoading"
      class="really-centered colored-red"
    >List of jobs is empty</div>

    <!-- template for configuration -->
    <launch-analysis-form
      :show-modal="showAnalysisForm"
      :job-selected-for-analysis="jobSelectedForAnalysis"
      :is-running-analysis="isRunningAnalysis"
      @change-modal-visibility="toggleModal"
      @analysis-config-ready="analysisConfigReady"
    />

    <delete-confirmation-modal ref="deletionModal"/>

  </div>
</template>


<script>
import InfiniteLoading from 'vue-infinite-loading';
import sortBy from 'lodash/sortBy';
import remove from 'lodash/remove';
import get from 'lodash/get';
import SimulationItem from '@/components/list-simulations/simulation-item.vue';
import unicore from '@/services/unicore';
import analysisConfig from '@/config/analysis-config';
import LaunchAnalysisForm from '@/components/list-simulations/analysis/launch-analysis-form.vue';
import analysisHelper from '@/services/helper/analysis-helper';
import listJobsHelper from '@/services/helper/list-jobs-helper';
import eventBus from '@/services/event-bus';
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
      allSimulations: [],
      viewList: [],
      jobSelectedForAnalysis: null,
      isRunningAnalysis: false,
      originalCombo: null,
    };
  },
  computed: {
    listIsLoading() {
      return this.$store.state.list.isLoading;
    },
  },
  mounted() {
    eventBus.$on('reload-jobs-list', this.reloadJobsListBinded);

    eventBus.$on('apply-filters', () => {
      const filtered = this.applyFiltersToSims(this.allSimulations);
      this.viewList = sortBy(filtered, 'submissionTime').reverse();
    });

    if (this.$route.params.computerParam) {
      eventBus.$emit(
        'change-computer',
        this.$route.params.computerParam,
        () => eventBus.$emit('reload-jobs-list'),
      );
    } else {
      eventBus.$emit('reload-jobs-list');
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
        this.fetchJobs().catch(error => this.$Message.error(`Fetch jobs - ${error.message}`));
      });
    },

    applyFiltersToSims(simulations) {
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
          computerParam: this.$store.state.fullConfig.computer,
        },
      });
    },

    runAnalysis(job) {
      this.showAnalysisForm = true;
      // set the origin computer details
      this.jobSelectedForAnalysis = job;
      // after the form will return to analysisConfigReady
    },

    getAccountFromLog(jobDetails) {
      const simulationLog = get(jobDetails, 'log[6]', '');
      const matchedProj = get(simulationLog.match(/Project=(.*?),/), '[1]', null);
      if (!matchedProj || matchedProj === 'NONE') return null;
      return matchedProj;
    },

    async analysisConfigReady(analysisParamsEdited) {
      if (!analysisParamsEdited) return;

      this.isRunningAnalysis = true;

      const newAnalysisParamsEdited = analysisParamsEdited;
      newAnalysisParamsEdited.from.workingDirectory = this.jobSelectedForAnalysis._links.workingDirectory.href;
      newAnalysisParamsEdited.accountSelected = this.getAccountFromLog(this.jobSelectedForAnalysis);

      const config = analysisConfig[this.$store.state.fullConfig.computer];
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

    async fetchJobs() {
      this.$store.dispatch('showLoader');
      this.$store.commit('setListIsLoading', true);

      // save information for cancel request if computer is changed
      const httpReqSource = unicore.getHttpReqSource();
      this.$store.commit('setupHttpReqSource', httpReqSource);

      const callbackEachSim = (simInfo) => {
        this.allSimulations.push(simInfo);
        const [filteredSimulation] = this.applyFiltersToSims([simInfo]);
        if (filteredSimulation) {
          this.viewList.push(filteredSimulation);
        }
      };
      await listJobsHelper.getSimulationsWithFiles(callbackEachSim);

      console.debug('Simulations loaded');

      this.viewList = sortBy(this.viewList, 'submissionTime').reverse();

      this.$store.commit('setListIsLoading', false);
      this.$store.dispatch('hideLoader');

      this.$store.commit('setAnalysisListIsLoading', true);
      const callbackEachAnalysis = (sim, newAnalysisStatus) => {
        this.$set(sim, 'analysisStatus', newAnalysisStatus);
      };
      await listJobsHelper.fetchAnalysisInfo(this.viewList, callbackEachAnalysis);
      console.debug('Analysis loaded');
      this.$store.commit('setAnalysisListIsLoading', false);
    },
  },
  beforeDestroy() {
    eventBus.$off('reload-jobs-list', this.reloadJobsListBinded);
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
