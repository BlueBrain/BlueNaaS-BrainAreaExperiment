<template>
    <div class="stimulation-form">
        <form>
        <div class="form-group">
            <label class="control-label" title="Name of a target to receive the stimulation">Target</label>
            <div class="controls autocomplete-container">
                <autocomplete-vue :list="processedTargetList" placeholder="Target" v-model="stimulusEditableObject.item.group"></autocomplete-vue>
            </div>
        </div>

        <div class="form-group">
            <label class="control-label" title="Type of the stimulus">Pattern</label>
            <div class="controls">
                <select class="form-control" v-model="stimulus.Pattern">
                    <option>Linear</option>
                    <option>RelativeLinear</option>
                    <option>Pulse</option>
                    <option>NPoisson</option>
                    <option>NPoissonInhomogenous</option>
                    <option>SubThreshold</option>
                    <option>Noise</option>
                    <option>SynapseReplay</option>
                    <option>Hyperpolarizing</option>
                    <option>ReplayVoltageTarget</option>
                    <option>SEClamp</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="control-label" title="Time when the stimulus commences. given in milliseconds(ms)">Delay(ms)</label>
            <div class="controls">
                <input v-model="stimulus.Delay" type="number" id="Delay" required placeholder="Delay" class="form-control">
            </div>
        </div>
        <div class="form-group">
            <label class="control-label" title="Time length of stimulus duration, given in milliseconds(ms)">Duration(ms)</label>
            <div class="controls">
                <input v-model="stimulus.Duration" type="number" id="Duration" required placeholder="Duration" class="form-control">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'Linear' || stimulus.Pattern == 'RelativeLinear' ">
            <label class="control-label" title="The amount of current initially injected when the stimulus activates. Given in mV">Amp start(mA)</label>
            <div class="controls">
                <input v-model="stimulus.AmpStart" type="number" id="AmpStart" placeholder="AmpStart" required class="form-control">
            </div>
        </div>


        <div class="form-group" v-if="stimulus.Pattern == 'Linear' || stimulus.Pattern == 'RelativeLinear' ">
            <label class="control-label" title="The final current when a stimulus concludes.">Amp end (mA)</label>
            <div class="controls">
                <input v-model="stimulus.AmpEnd" type="number" id="AmpEnd" placeholder="AmpEnd" required class="form-control">
            </div>
        </div>


        <div class="form-group" v-if="stimulus.Pattern == 'RelativeLinear'">
            <label class="control-label" title="The percentage of a cell's threshold current to inject at the start of the injection">Percent start</label>
            <div class="controls">
                <input v-model="stimulus.PercentStart" type="number" required id="PercentStart" placeholder="PercentStart" class="form-control">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'NPoisson' || stimulus.Pattern == 'NPoissonInhomogenous' ">
            <label class="control-label" title="Configure the random distribution">Lambda</label>
            <div class="controls">
                <input v-model="stimulus.Lambda" type="number" id="Lambda" placeholder="Lambda" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'NPoisson' || stimulus.Pattern == 'NPoissonInhomogenous' ">
            <label class="control-label" title="The strength of the created synapse">Weight</label>
            <div class="controls">
                <input v-model="stimulus.Weight" type="number" id="Weight" placeholder="Weight" required class="form-control" step="0.1">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'NPoisson' || stimulus.Pattern == 'NPoissonInhomogenous' ">
            <label class="control-label" ftitle="The number of synapses to create">Number of synapses</label>
            <div class="controls">
                <input v-model="stimulus.NumOfSynapses" type="number" id="NumOfSynapses" placeholder="Number of synapses" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'NPoisson' || stimulus.Pattern == 'NPoissonInhomogenous' ">
            <label class="control-label" title="Specifies a Synapse object type which is available to the simulator">Synapse type</label>
            <div class="controls">
                <input v-model="stimulus.SynapseType" type="text" id="SynapseType" placeholder="Synapse type" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'Pulse' ">
            <label class="control-label" title="The duration in milliseconds(ms) of a single pulse">Width(ms)</label>
            <div class="controls">
                <input v-model="stimulus.Width" type="number" id="Width" placeholder="Width" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'Pulse' ">
            <label class="control-label" title="The frequency of the pulse train">Frequency</label>
            <div class="controls">
                <input v-model="stimulus.Frequency" type="number" id="Frequency" placeholder="Frequency" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'Pulse' ">
            <label class="control-label" title="A standard deviation value each cell will apply to the delay in order to add variation to the stimulation">Offset</label>
            <div class="controls">
                <input v-model="stimulus.Offset" type="number" id="Offset" placeholder="Offset" required class="form-control">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'RelativeLinear' ">
            <label class="control-label" title="The percentage of a cell's threshold current to inject at the end of the injection">Percent end</label>
            <div class="controls">
                <input v-model="stimulus.PercentEnd" type="number" id="PercentEnd" placeholder="PercentEnd" required class="form-control">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'SubThreshold'">
            <label class="control-label" title="Each cell has a defined amount of current which will trigger one spike in 2 seconds. This current will be scaled according to the Percent less value">Percent less</label>
            <div class="controls">
                <input v-model="stimulus.PercentLess" type="number" id="PercentLess" placeholder="PercentLess" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'Noise'">
            <label class="control-label" title="The mean value of current to inject.">Mean(mA)</label>
            <div class="controls">
                <input v-model="stimulus.Mean" type="number" id="Mean" placeholder="Mean" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'Noise'">
            <label class="control-label" title="The mean value of current to inject is a percentage of a cell's threshold current.">Mean percent</label>
            <div class="controls">
                <input v-model="stimulus.MeanPercent" type="number" id="MeanPercent" placeholder="MeanPercent" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'Noise'">
            <label class="control-label" title="Variance around the mean">Variance</label>
            <div class="controls">
                <input v-model="stimulus.Variance" type="number" id="Variance" placeholder="Variance" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'SynapseReplay'">
            <label class="control-label" title="The location of the file with the spike information for injection.">Spike file</label>
            <div class="controls">
                <input v-model="stimulus.SpikeFile" type="text" id="SpikeFile" placeholder="SpikeFile" required class="form-control">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'ReplayVoltageTrace'">
            <label class="control-label" title="H5 file to open where voltage information are stored">H5 file</label>
            <div class="controls">
                <input v-model="stimulus.H5File" type="text" id="H5File" placeholder="DataSetLabel" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'ReplayVoltageTrace'">
            <label class="control-label" title="The dataset to open to get the voltage data.">Dataset label</label>
            <div class="controls">
                <input v-model="stimulus.DataSetLabel" type="text" id="DataSetLabel" placeholder="DataSetLabel" required class="form-control">
            </div>
        </div>
        <div class="form-group" v-if="stimulus.Pattern == 'SEClamp'">
            <label class="control-label" title="Specifies the membrane voltage the targeted cells should be held at. in mV.">Voltage(mV)</label>
            <div class="controls">
                <input v-model="stimulus.Voltage" type="number" id="Voltage" placeholder="Voltage" required class="form-control">
            </div>
        </div>
        <div class="button-container">
            <input class="ok-button" type="submit" @click="editItem" value="Ok">
            <input class="cancel-button" type="button" @click="closeForm" value="Cancel">
        </div>
    </form>

</div>
</template>

<script>
import AutocompleteVue from 'autocomplete-vue';
import targetList from 'assets/targetList.json';
import {autocompleteBus} from 'autocomplete-vue';

export default {
   'name': 'stimulation-form',
   'props': ['stimulusEditableObject'],
   'data': function () {
      return {
         processedTargetList: undefined,
         stimulus: this.stimulusEditableObject.stimulusInfo,
         item: this.stimulusEditableObject.item,
         form: undefined
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
      'convertToNumbers': function () {
        // this converts the number inputs in floats
        let n = this.$el.querySelectorAll('input[type=number]');
        for(let i = 0; i < n.length; i++) {
            let input = n[i];
            this.stimulus[input.id] = parseFloat(input.value);
        }
      },
      'editItem': function () {
        this.checkTimeValues(this.form);
        if(this.form.checkValidity()) {
            this.convertToNumbers();
            this.$emit('editItem', {
                'item': this.item,
                'stimulus': this.stimulus,
                'callback': this.stimulusEditableObject.callback
            });
        }
      },
      'checkTimeValues': function (form) {
        let start = parseFloat(this.stimulus.Delay);
        let end = parseFloat(this.stimulus.Duration);
        if (start > end) {
            form.elements.Delay.setCustomValidity('Delay should be smaller than duration');
        } else {
            form.elements.Delay.setCustomValidity('');
        }
      }
    },
    'created': function () {
      this.processTargetList();
      let that = this;
      autocompleteBus.$on('autocomplete-select', function (selectedValue) {
        that.item.group = selectedValue;
        that.stimulus.Target = selectedValue;
      });
    },
    'mounted': function () {
        this.form = this.$el.querySelector('form');
    },
    'watch': {
        'stimulus.Delay': function (newVal) {
            this.item.start = parseFloat(newVal);
            this.form.elements.Delay.setCustomValidity(''); // clears errors
        },
        'stimulus.Duration': function (newVal) {
            this.item.end = parseFloat(newVal);
        },
        'stimulus.Pattern': function (newVal) {
            this.item.content = newVal;
        },
        'stimulus.Target': function (newVal) {
            this.item.group = newVal;
        }
    }
};
</script>

<style scoped>
.stimulus-form {
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
.stimulation-form .form-group input
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
