<template>
    <table class="launch-form">
        <!-- be carefull cause when the popup in swal2 is open the vue models are not related anymore
            so add the functionality in showSimulationParameters -->
        <div class="form-group">
            <label class="control-label">Title: </label>
            <div class="controls">
                <input
                    type="text"
                    name="Title of the Job"
                    class="title"
                    v-model="title"
                    placeholder="Job's title">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Computer: </label>
            <div class="controls">
                <select
                    class="computer"
                    title="Supercomputer"
                    v-model="computer">
                    <option v-for="resources in computersAvailable">
                        {{ resources }}
                    </option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Project: </label>
            <div class="controls">
                <input
                    type="text"
                    name="Project to be used"
                    class="project"
                    v-model="project"
                    placeholder="(optional)">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Nodes: </label>
            <div class="controls">
                <input
                    type="number"
                    name="Number of computer resources"
                    class="nodes"
                    v-model="nodes"
                    placeholder="Node to allocate">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">RunTime:</label>
            <div class="controls">
                <input
                    type="number"
                    name="Time until timeout"
                    class="runtime"
                    v-model="runtime"
                    placeholder="(optional)">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">CPUs Per Node:</label>
            <div class="controls">
                <input
                    type="number"
                    name="CPUs per node"
                    class="cpus"
                    v-model="cpus"
                    placeholder="(optional)">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Circuit Target:</label>
            <div class="controls">
                <input
                    type="text"
                    name="Circuit Target"
                    class="circuit-target"
                    v-model="circuitTarget"
                    placeholder="(slice-4)">
            </div>
        </div>
        <div class="form-group">
            <div colspan="2">
                <div
                    class="preview-config"
                    @click="previewConfig"
                >
                    Preview Config
                </div>
            </div>
        </div>
        <div class="button-container">
            <input class="ok-button" type="button" @click="editItem" value="Ok">
            <input class="cancel-button" type="button" @click="closeForm" value="Cancel">
        </div>
    </table>
</template>

<script>
    import 'assets/css/simulation.css';
    import launchConfig from 'assets/simulation-config.json';
    import utils from 'assets/utils.js';
    export default {
      'data': function() {
        return {
          'title': '',
          'computer': launchConfig.default,
          'computersAvailable': launchConfig.available,
          'applicationName': 'Bash shell',
          'nodes': 1,
          'runtime': 86400,
          'project': '',
          'cpus': '',
          'circuitTarget': 'slice-4',
        };
      },
      'methods': {
        'editItem': function() {
          this.title = utils.filterName(this.title);
          let filtered = Object.assign({}, this.$data);
          // remove the empty items
          Object.keys(filtered).forEach((key) => {
            if (!filtered[key]) {
              delete filtered[key];
            }
          });
          this.$emit('runConfigReady', filtered);
        },
        'closeForm': function() {
          this.$emit('changeModalVisibility', false);
        },
        'previewConfig': function() {
          this.$emit('previewConfig');
        },
        'changeValues': function(computer) {
          // the first time load the default values.
          this.runtime = launchConfig[computer].time;
          this.nodes = launchConfig[computer].nodes;
          this.cpus = launchConfig[computer].cpus;
        },
      },
      'mounted': function() {
        this.changeValues(this.computer);
      },
      'watch': {
        'computer': function(newVal) {
          this.changeValues(newVal);
          this.computer = newVal;
          this.$emit('computerChanged', newVal);
        },
        'circuitTarget': function(newVal) {
          this.$emit('circuitTargetChanged', newVal);
        },
      },
    };
</script>

<style scoped>
    .launch-form {
        width: 100%;
    }
    .computer {
        width: 98%;
    }
    .preview-config {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-style: dotted;
        border-radius: 15px;
        border-width: 2px;
        padding: 5px 15px;
    }
</style>