<!--
This will only display the item. It knows where to put all the information.
-->
<template>
    <div class="simulation-item">
        <div class="left-part">
            <a
                @click="showDetails"
                title="View details"
                class="button-with-icon">
                    <i class="material-icons">pageview</i>
            </a>
            <div class="id">{{getId}}</div>
        </div>
        <div class="middle-part">{{job.status}}</div>
        <div class="right-part">
            <div>{{getDate}}</div>
            <div class="inline-flex">
                <a @click="deleteJob" class="button-with-icon" title="Delete job forever"><i class="material-icons">delete_forever</i>Delete</a>
                <a @click="runValidation" class="button-with-icon" title="Start validation"><i class="material-icons">play_arrow</i>Validation</a>
                <a @click="abortJob" class="button-with-icon" title="Cancel Job"><i class="material-icons">cancel</i>Abort</a>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    'name': 'simulationItem',
    'props': ['job'],
    'methods': {
        'runValidation': function() {
            this.$emit('runValidation');
        },
        'abortJob': function() {
            let actionURL = this.job._links.self.href + '/actions/abort';
            this.$emit('actionJob', {'url': actionURL, 'text': 'Job Aborted'});
        },
        'deleteJob': function() {
            let url = this.job._links.self.href;
            this.$emit('deleteJob', url);
        },
        'showDetails': function() {
            this.$emit('showDetails', this.job);
        },
    },
    'computed': {
        'getId': function() {
            let url = this.job._links.self.href;
            if (this.job._links && url) {
                return url.substr(url.lastIndexOf('/') + 1);
            }
        },
        'getDate': function() {
            let stringDate = this.job.submissionTime;
            if (stringDate) {
                return new Date(this.job.submissionTime).toLocaleString();
            }
        },
    },
};
</script>

<style scoped>
.simulation-item {
    display: flex;
    border-radius: 5px;
    justify-content: space-between;
    padding: 5px;
    margin: 5px;
    background-color: rgba(216, 223, 239, 0.38);
}
.left-part {
    width: 40%;
    display: flex;
    justify-content: start;
    align-items: center;
}
.middle-part {
    width: 20%;
    display: flex;
    align-items: center;
}
.right-part {
    width: 40%;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
}
.right-part .inline-flex {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
}
a.button-with-icon {
    color: #fff;
    background-color: #879fcb;
    letter-spacing: .5px;
    cursor: pointer;
    padding: 5px 10px;
    margin: 5px 5px;
    border-radius: 3px;
    display: flex;
    align-items: center;
}
</style>
