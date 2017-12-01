<template>
    <div class="analysis">
        <div
            class="plot-container"
            v-for="plot in analysisConfig.plots"
        >
            <span class="plot-label">{{plot}}</span>
            <img
                class="analysis-plot"
                v-if="itemDetails[plot]"
                :src="itemDetails[plot]"
            >
            <div v-else>{{ noValidationText }}</div>
        </div>
        <a class="button-with-icon" v-if="itemDetails.intervalReference" title="Loading">
            <i class="material-icons spin">autorenew</i>
        </a>
    </div>
</template>

<script>
    import analysisConfig from 'assets/analysis-config.json';
    export default {
        'name': 'analysis',
        'props': ['itemDetails'],
        'data': function() {
            return {
                'analysisConfig': analysisConfig,
            };
        },
        'computed': {
            'noValidationText': function() {
                if (this.itemDetails.id) {
                    return 'No available image yet';
                } else {
                    return 'No Analysis was run yet';
                }
            },
        },
    };
</script>

<style scoped>
    .analysis-plot {
        width: 400px;
        height: 400px;
    }
    .analysis {
        display: flex;
        flex-wrap: wrap;
    }
    .plot-container {
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .plot-label {
        font-size: 24px;
        margin: 5px 0;
    }
</style>