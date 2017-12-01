<template>
    <table class="launch-form">
        <div class="form-group">
            <label class="control-label">Title:</label>
            <div class="controls">
                <input type="text" name="" class="title" v-model="title" placeholder="Job's title">
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
            <label class="control-label">Nodes: </label>
            <div class="controls">
                <input type="number" name="" class="nodes" v-model="nodes" placeholder="Node to allocate">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Analysis: </label>
            <div class="controls analysis-list">
                <div class="checkbox-container" v-for="analysis in analysisToRun">
                    <input class="small" type="checkbox" :value="analysis" v-model="checkedAnalysis">
                    <label class="" :for="analysis">{{ analysis }}</label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Cells (%): </label>
            <div class="controls">
                <input type="number" v-model="percentageOfCells" placeholder="Cells (%) to visualize">
            </div>
        </div>
        <div class="button-container">
            <input class="ok-button" type="button" @click="editItem" value="Ok">
            <input class="cancel-button" type="button" @click="closeForm" value="Cancel">
        </div>
    </table>
</template>

<script>
    import 'assets/css/run-simulation.css';
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
                'percentageOfCells': 50,
            };
        },
        'methods': {
            'editItem': function() {
                this.$emit('validationConfigReady', this.$data);
            },
            'closeForm': function() {
                this.$emit('changeModalVisibility', false);
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
        align-items: flex-end;
    }
    .analysis-list {

    }
    .analysis-list .small {
        width: 10%;
        margin: 0;
    }
</style>