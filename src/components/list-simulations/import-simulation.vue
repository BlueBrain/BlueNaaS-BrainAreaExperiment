
<template>
  <div>
    <i-button
      type="primary"
      icon="md-cloud-upload"
      @click="showModal"
    >Import Simulation</i-button>

    <modal
      width="350"
      v-model="showImportModal"
      class="report-form"
    >
      <h3 slot="header">Import Simulation</h3>
      <div>

        <i-form
          label-position="right"
          ref="formValidate"
          :model="formModel"
          :rules="ruleValidate"
          :label-width="150"
        >
          <form-item label="Title:" prop="title">
            <i-input
              v-model="formModel.title"
              placeholder="Imported Simulation"
            />
          </form-item>

          <form-item label="Full Path to the simulation directory:" prop="simPath">
            <i-input
              v-model="formModel.simPath"
              placeholder="Full path"
            />
          </form-item>

        </i-form>
      </div>

      <div slot="footer">
        <i-button
          @click="showImportModal = !showImportModal"
        >Cancel</i-button>

        <i-button
          type="primary"
          @click="importSim"
          :loading="isLoading"
        >Import</i-button>
      </div>
    </modal>
  </div>
</template>


<script>
import { urlToComputerAndId, importPersonalSimulation } from '@/services/unicore';
import auth from '@/services/auth';
import { computers } from '@/common/constants';

export default {
  name: 'ImportSimulation',
  data() {
    return {
      showImportModal: false,
      formModel: {
        title: '',
        simPath: '',
      },
      ruleValidate: {
        title: [{ required: true, trigger: 'blur' }],
        simPath: [{ required: true, validator: this.validatePath, trigger: 'blur' }],
      },
      isLoading: false,
      userProject: null, // so far only for BB5
    };
  },
  methods: {
    showModal() {
      this.showImportModal = true;
      this.getUserProjects();
    },
    cleanUpStrings() {
      this.formModel.title = this.formModel.title.trim();
      this.formModel.simPath = this.formModel.simPath.replace(/\/$/, '');
    },
    validatePath(rule, value, callback) {
      if (!value) callback(new Error('simulation path is required'));
      else if (!value.startsWith('/') || !value.includes('/', 1)) {
        callback(new Error('Please enter valid full path'));
      } else callback();
    },
    async importSim() {
      this.cleanUpStrings();
      const isValid = await this.$refs.formValidate.validate();
      if (!isValid) return;
      this.isLoading = true;
      const jobDetails = await importPersonalSimulation(
        this.formModel.title,
        this.formModel.simPath,
        this.userProject,
      );
      const { id } = urlToComputerAndId(jobDetails._links.self.href);
      this.isLoading = false;
      this.$router.push({
        name: 'details',
        params: {
          jobId: id,
          computerParam: this.$store.state.currentComputer,
        },
      });
    },
    getUserProjects() {
      if (this.$store.state.currentComputer !== computers.BB5) return;
      auth.getUserProjects().then((projects) => {
        [this.userProject] = projects;
      }).catch((e) => {
        this.$Message.error('Error fetching user projects', e);
      });
    },
  },
};
</script>
