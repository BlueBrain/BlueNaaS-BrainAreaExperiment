<template>
    <div class="analysis">
        <img class="analysis-plot" v-if="itemDetails.psth" :src="itemDetails.psth">
        <div v-else>No image yet available</div>
        <a class="button-with-icon" v-if="itemDetails.intervalReference" title="Loading">
            <i class="material-icons spin">autorenew</i>
        </a>
    </div>
</template>
<script>
    export default {
        'name': 'analysis',
        'props': ['itemDetails'],
    };
</script>
<style scoped>
    .analysis-plot {
        width: 400px;
        height: 400px;
    }
</style>