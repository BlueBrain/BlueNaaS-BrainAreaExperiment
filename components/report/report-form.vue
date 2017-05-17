<template>
    <div class="report-form">
        <form name="reportForm">
            <div class="modal-body">
                <div class="form-group">
                    <label class="control-label" title="Defines what is to be reported. Note that cell targets versus compartment targets can influence report behavior">Target</label>
                    <div class="controls autocomplete-container">
                        <autocomplete-vue :list="processedTargetList" placeholder="Target" v-model="report.Target"></autocomplete-vue>
                    </div>
                </div>

                <div class="form-group">
                    <label class="control-label" title="Compartment means that each compartment outputs separately in the report file. Summation will sum up the compartments and write a single value to the report. Synapse indicates that each synapse will have a separate entry in the report.">Type</label>
                    <div class="controls">
                        <select class="form-control" v-model="report.Type" type="text" id="Type" placeholder="Type" required>
                            <option>Compartment</option>
                            <option>Summation</option>
                            <option>Synapse</option>
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
                          <option>nA</option>
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
                        <input v-model="report.EndTime" type="number" id="EndTime" placeholder="EndTime" required class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label" title="The frequency of reporting in milliseconds(ms)">Dt(ms)</label>
                    <div class="controls">
                        <input v-model="report.Dt" type="number" id="Dt" placeholder="Dt" required step="0.01" class="form-control">
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
                <div class="form-group" v-if="report.Type == 'Summation'">
                    <label class="control-label" title="Handling of density values">Scaling</label>
                    <div class="controls">
                        <select class="form-control" v-model="report.Scaling" type="text" id="Format" placeholder="Format" required>
                            <option>Area</option>
                            <option>None</option>
                        </select>
                    </div>
                </div>
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
import {autocompleteBus} from 'autocomplete-vue';

export default {
   'name': 'report-form',
   'props': ['reportEditableObject'],
   'data': function () {
      return {
        processedTargetList: undefined,
        report: this.reportEditableObject.report,
        item: this.reportEditableObject.item
      };
   },
   'components': {
      'autocomplete-vue': AutocompleteVue
   },
   'methods': {
      'processTargetList': function () {
         let list = [];
         for(let i=0; i<targetList.length; i++) {
            list.push({'name': targetList[i]});
         }
         this.processedTargetList = list;
      },
      'closeForm': function () {
        this.$emit('changeModalVisibility', false);
      },
      'editItem': function () {
        this.checkTimeValues(this.form);
        if(this.form.checkValidity()) {
            this.convertToNumbers();
            this.$emit('editItem', {
                'item': this.item,
                'report': this.report,
                'callback': this.reportEditableObject.callback
            });
        }
      },
      'convertToNumbers': function () {
        // this converts the number inputs in floats
        let n = this.$el.querySelectorAll('input[type=number]');
        for(let i = 0; i < n.length; i++) {
            let input = n[i];
            this.report[input.id] = parseFloat(input.value);
        }
      },
      'checkTimeValues': function (form) {
        let start = parseFloat(this.report.StartTime);
        let end = parseFloat(this.report.EndTime);
        if (start > end) {
            form.elements.StartTime.setCustomValidity('StartTime should be smaller than EndTime');
        } else {
            form.elements.StartTime.setCustomValidity('');
        }
      }
    },
    'created': function () {
      this.processTargetList();
      let that = this;
      autocompleteBus.$on('autocomplete-select', function (selectedValue) {
        that.item.group = selectedValue;
        that.report.Target = selectedValue;
      });
    },
    'mounted': function () {
        this.form = this.$el.querySelector('form');
    },
    'watch': {
        'report.StartTime': function (newVal) {
            this.item.start = parseFloat(newVal);
            this.form.elements.StartTime.setCustomValidity(''); // clears errors
        },
        'report.EndTime': function (newVal) {
            this.item.end = parseFloat(newVal);
        },
        'report.ReportOn': function (newVal) {
            this.item.content = newVal;
        },
        'report.Target': function (newVal) {
            this.item.group = newVal;
        }
    }
};
</script>

<style scoped>
.report-form {
    max-width: 400px;
    margin: 0 auto;
}
.form-group {
    margin: 10px 0;
    display: flex;
    justify-content: space-around;
}
.form-group .controls select {
    font-size: 1rem;
}
.control-label {
    display: inline-flex;
    width: 40%;
}
div.controls {
    display: inline-flex;
    width: 55%;
}
div.controls input,
div.controls select.form-control {
    width: 230px;
    margin-right: 5px;
}
.ok-button, .cancel-button {
    border: 0;
    border-radius: 3px;
    box-shadow: none;
    color: #fff;
    cursor: pointer;
    font-size: 17px;
    font-weight: 500;
    margin: 15px 5px 0;
    padding: 10px 32px;
}
.ok-button {
    background-color: #548d68;
}
.cancel-button {
    background-color: #ac6067;
}
.button-container {
    display: flex;
    justify-content: space-around;
    width: 50%;
    margin: 0 auto;
}
</style>

<style>
.report-form .form-group input
 {
    padding: 2px 5px;
    font-size: 1rem;
    color: #464a4c;
    background-color: #fff;
    background-image: none;
    -webkit-background-clip: padding-box;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.15);
    border-radius: .25rem;
    -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
    -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
}
div.controls .autocomplete {
    width: 205px;
}
</style>
