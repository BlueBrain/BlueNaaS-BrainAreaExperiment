<template>
    <div class="report-form">
        <form name="reportForm modal-form">
            <div class="modal-body">
                <div class="form-group">
                    <label class="control-label" title="Defines the region from where the data will be reported.">Target</label>
                    <div class="controls autocomplete-container">
                        <autocomplete-vue :list="processedTargetList" placeholder="Target" v-model="report.Target"></autocomplete-vue>
                    </div>
                </div>

                <div class="form-group">
                    <label class="control-label" title="Compartment means that each compartment outputs separately in the report file. Synapse indicates that each synapse will have a separate entry in the report.">Type</label>
                    <div class="controls">
                        <select class="form-control" v-model="report.Type" type="text" id="Type" placeholder="Type" required>
                            <option
                                v-for="type in filteredTypes"
                                v-bind:key="type"
                            >
                                {{type}}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="The NEURON variable to access.">ReportOn</label>
                    <div class="controls">
                        <input v-model="report.ReportOn" type="text" id="ReportOn" placeholder="ReportOn" required class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="The unit of the NEURON variable.">Unit</label>
                    <div class="controls">
                        <select v-model="report.Unit" type="text" id="Unit" placeholder="Unit" required class="form-control">
                          <option>mV</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="Time to start reporting">StartTime(ms)</label>
                    <div class="controls">
                        <input v-model="report.StartTime" type="number" id="StartTime" placeholder="StartTime" required class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="Time to stop reporting">EndTime(ms)</label>
                    <div class="controls">
                        <input v-model="report.EndTime" type="number" min="0" id="EndTime" placeholder="EndTime" required class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="The frequency of reporting in milliseconds(ms)">Dt(ms)</label>
                    <div class="controls">
                        <input v-model="report.Dt" type="number" min="0" id="Dt" placeholder="Dt" required step="0.01" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="Defines the report output format">Format</label>
                    <div class="controls">
                        <select class="form-control" v-model="report.Format" type="text" id="Format" placeholder="Format" required>
                            <option>ASCII</option>
                            <option>HDF5</option>
                            <option>Bin</option>
                        </select>
                    </div>
                </div>
                <!-- <div class="form-group" v-if="report.Type == 'Summation'">
                    <label class="control-label" title="Handling of density values">Scaling</label>
                    <div class="controls">
                        <select class="form-control" v-model="report.Scaling" type="text" id="Format" placeholder="Format" required>
                            <option>Area</option>
                            <option>None</option>
                        </select>
                    </div>
                </div> -->
            </div>
            <div class="button-container">
                <input class="ok-button" type="submit" value="OK" @click="editItem">
                <button class="cancel-button" @click="closeForm">Cancel</button>
            </div>
        </form>
</div>
</template>

<script>
import AutocompleteVue from 'autocomplete-vue';
import targetList from 'assets/targetList.json';
import 'assets/css/simulation.css';
export default {
    'name': 'report-form',
    'props': ['reportEditableObject'],
    'data': function() {
        return {
            'processedTargetList': undefined,
            'report': this.reportEditableObject.item.reportInfo,
            'item': this.reportEditableObject.item,
            'typesFull': ['Compartment', 'Synapse'],
            'filteredTypes': [],
        };
    },
    'components': {
        'autocomplete-vue': AutocompleteVue,
    },
    'methods': {
        'processTargetList': function() {
            let list = [];
            for (let i=0; i<targetList.length; i++) {
                list.push({'name': targetList[i]});
            }
            this.processedTargetList = list;
        },
        'closeForm': function() {
            this.$emit('changeModalVisibility', false);
        },
        'editItem': function() {
            this.checkTimeValues(this.form);
            if (this.form.checkValidity()) {
                this.convertToNumbers();
                this.$emit('editItem', {
                    'item': this.item,
                    'callback': this.reportEditableObject.callback,
                });
            }
        },
        'convertToNumbers': function() {
        // this converts the number inputs in floats
            let n = this.$el.querySelectorAll('input[type=number]');
            for (let i = 0; i < n.length; i++) {
                let input = n[i];
                this.report[input.id] = parseFloat(input.value);
            }
        },
        'checkTimeValues': function(form) {
            let start = parseFloat(this.report.StartTime);
            let end = parseFloat(this.report.EndTime);
            if (start > end) {
                form.elements.StartTime.setCustomValidity('StartTime should be smaller than EndTime');
            } else {
                form.elements.StartTime.setCustomValidity('');
            }
        },
    },
    'created': function() {
        this.processTargetList();
        this.filteredTypes = this.typesFull;
    },
    'mounted': function() {
        this.form = this.$el.querySelector('form');
    },
    'watch': {
        'report.StartTime': function(newVal) {
            this.item.start = parseFloat(newVal);
            this.form.elements.StartTime.setCustomValidity(''); // clears errors
        },
        'report.EndTime': function(newVal) {
            this.item.end = parseFloat(newVal);
        },
        'report.ReportOn': function(newVal) {
            this.item.content = newVal;
        },
        'report.Target': function(newVal) {
            this.item.group = newVal;
            this.report.Target = newVal;
            // check for AllCompartments allow only type compartment
            if (this.report.Target === 'AllCompartments') {
                this.filteredTypes = ['Compartment'];
                this.report.Type = this.filteredTypes[0];
            } else {
                this.filteredTypes = this.typesFull;
            }
        },
    },
};
</script>

