<template>
    <div class="files">
        <div v-for="file in itemDetails.filesList" class="file-item" @click="openFile(file)">
            <i class="material-icons">launch</i> {{ file }}
        </div>
        <a class="button-with-icon" v-if="itemDetails.intervalReference" title="Loading">
            <i class="material-icons spin">autorenew</i>
        </a>
    </div>
</template>
<script>
    export default {
        'name': 'files',
        'props': ['itemDetails'],
        'methods': {
            'openFile': function(file) {
                this.$emit('openFile', file);
            },
        },
    };
</script>
<style scoped>
    .file-item {
        display: inline-flex;
        min-width: 250px;
        cursor: pointer;
    }
    a.button-with-icon {
        display: block;
    }
</style>