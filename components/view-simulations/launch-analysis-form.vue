<template>
    <table class="launch-form">
        <div class="form-group">
            <label class="control-label">Title:</label>
            <div class="controls">
                <input type="text" name="" class="title" v-model="title" placeholder="Job's title">
            </div>
        </div>

        <div class="form-group">
            <label class="control-label">Target:</label>
            <div class="controls">
                <target-autocomplete
                    @targetChanged="targetChanged"
                ></target-autocomplete>
            </div>
        </div>

        <div class="form-group">
            <label class="control-label">Origin:</label>
            <div class="controls">{{ from.computer }}</div>
        </div>
        <div class="form-group">
            <label class="control-label">Destination: </label>
            <div class="controls">{{ to.computer }}</div>
        </div>
        <div class="form-group">
            <label class="control-label">Analysis: </label>
            <div class="controls analysis-list">
                <div
                    class="checkbox-container"
                    v-for="analysis in analysisToRun"
                >
                    <input
                        class="small"
                        type="checkbox"
                        :id="analysis.param"
                        :value="analysis.param"
                        v-model="checkedAnalysis"
                    >
                    <label :for="analysis.param">{{ analysis.name }}</label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Cells (number): </label>
            <div class="controls">
                <input type="number" v-model="numberOfCells" placeholder="Cells (number) to visualize">
            </div>
        </div>
        <div class="footer">
            <div id="tip" class="tip">
                <div class="tips">
                    <div v-for="tip in tipTexts">{{tip}}</div>
                </div>
                <div class="close">
                    <i class="centered material-icons" @click="closeTip">close</i>
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
    import targetAutocomplete from 'components/shared/autocomplete-targets.vue';
    import utils from 'assets/utils.js';
    export default {
      'props': ['defaultAnalysisConfig'],
      'data': function() {
        return {
          'from': {
            'workingDirectory': null,
            'computer': this.defaultAnalysisConfig.from,
          },
          'to': {
            'workingDirectory': null, // create a new one
            'computer': this.defaultAnalysisConfig.to,
          },
          'files': [], // this will be filled in later in UnicoreAPI
          'nodes': 1,
          'title': '',
          'analysisToRun': this.defaultAnalysisConfig.analysisAvailable,
          'checkedAnalysis': [],
          'numberOfCells': 5,
          'tipTexts': [
            `To run the Analysis we need to copy the output from the Simulation to ${this.defaultAnalysisConfig.to} (because that machine has the analysis packages installed) and run the new Analysis Job.`,
            'The results of the Analysis will be shown in the detailed page.',
          ],
          'target': '',
        };
      },
      'components': {
        'target-autocomplete': targetAutocomplete,
      },
      'mounted': function() {
        if (localStorage.getItem('showAnalysisTip') === 'false') {
          this.$nextTick(() => this.closeTip());
        }
      },
      'methods': {
        'editItem': function() {
          this.title = utils.filterName(this.title);
          this.$emit('analysisConfigReady', this.$data);
        },
        'closeForm': function() {
          this.$emit('changeModalVisibility', false);
        },
        'closeTip': function() {
          let tipElement = this.$el.querySelector('#tip');
          tipElement.remove();
          localStorage.setItem('showAnalysisTip', false);
        },
        'targetChanged': function(newTarget) {
          this.target = newTarget;
        },
      },
    };
</script>

<style scoped>
    .launch-form {
        width: 100%;
    }
    .analysis-list {
        flex-direction: column;
    }
    .analysis-list .checkbox-container {
        display: flex;
        align-items: center;
        border-style: solid;
        border-radius: 5px;
        border-width: 1px;
        border-color: lightgray;
        margin-bottom: 5px;
    }
    .analysis-list .small {
        width: 10%;
        margin: 3px 5px 0 0;
    }
</style>