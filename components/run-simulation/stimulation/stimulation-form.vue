<template>
    <div class="stimulation-form">
        <form class="modal-form">
        <div class="form-group">
            <label class="control-label" title="Name of a target to receive the stimulation">Target</label>
            <div class="controls autocomplete-container">
                <autocomplete-vue :list="processedTargetList" id="Target" placeholder="Target" v-model="stimulus.Target"></autocomplete-vue>
            </div>
        </div>

        <div class="form-group">
            <label class="control-label" title="Type of the stimulus">Pattern</label>
            <div class="controls">
                <select class="form-control" id="Pattern" v-model="stimulus.Pattern">
                    <option>Poisson</option>
                </select>
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'Poisson'">
            <label class="control-label" title="Configure the random distribution">Lambda</label>
            <div class="controls">
                <input v-model="stimulus.Lambda" type="number" min="0" id="Lambda" placeholder="Lambda" required class="form-control">
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
                <input v-model="stimulus.Duration" type="number" min="0" id="Duration" required placeholder="Duration" class="form-control">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'Poisson'">
            <label class="control-label" title="The strength of the created synapse">Weight</label>
            <div class="controls">
                <input v-model="stimulus.Weight" type="number" min="0" id="Weight" placeholder="Weight" required class="form-control" step="0.1">
            </div>
        </div>

        <div class="form-group" v-if="stimulus.Pattern == 'Poisson'">
            <label class="control-label" title="The number of synapses to create">Number of synapses</label>
            <div class="controls">
                <input v-model="stimulus.NumOfSynapses" type="number" min="0" id="NumOfSynapses" placeholder="Number of synapses" required class="form-control">
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
import 'assets/css/simulation.css';
export default {
    'name': 'stimulation-form',
    'props': ['editableItem'],
    'data': function() {
        return {
            'processedTargetList': undefined,
            'item': this.editableItem.item,
            'stimulus': this.editableItem.item.stimulusInfo,
            'form': undefined,
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
        'convertToNumbers': function() {
            // this converts the number inputs in floats
            let n = this.$el.querySelectorAll('input[type=number]');
            for (let i = 0; i < n.length; i++) {
                let input = n[i];
                this.stimulus[input.id] = parseFloat(input.value);
            }
        },
        'editItem': function() {
            this.checkTimeValues(this.form);
            this.checkTargets(this.form);
            if (this.form.checkValidity()) {
                this.items;
                this.convertToNumbers();
                this.item.stimulusInfo = this.stimulus;
                this.$emit('editItem', {
                    'item': this.item,
                    'callback': this.editableItem.callback,
                });
                this.item = null;
                this.stimulus = null;
            }
        },
        'checkTimeValues': function(form) {
            let start = parseFloat(this.stimulus.Delay);
            let end = parseFloat(this.stimulus.Duration);
            if (start > end) {
                form.elements.Delay.setCustomValidity('Delay should be smaller than duration');
            } else {
                form.elements.Delay.setCustomValidity('');
            }
        },
        'checkTargets': function(form) {
            let found = this.processedTargetList.filter((t) => {
                return t.name === this.stimulus.Target;
            });
            let targetElement = form.elements[0]; // target input
            if (found.length <= 0) {
                targetElement.setCustomValidity('Target should be in the list. try: slice');
            } else {
                targetElement.setCustomValidity('');
            }
        },
        'cleanStimulus': function() {
            let cleanStim = {
                'Delay': this.stimulus.Delay,
                'Duration': this.stimulus.Duration,
                'Pattern': this.stimulus.Pattern,
                'Target': this.stimulus.Target,
            };
            this.stimulus = cleanStim;
        },
    },
    'created': function() {
        this.processTargetList();
    },
    'mounted': function() {
        this.form = this.$el.querySelector('form');
    },
    'watch': {
        'stimulus.Delay': function(newVal) {
            this.item.start = parseFloat(newVal);
            this.form.elements.Delay.setCustomValidity(''); // clears errors
        },
        'stimulus.Duration': function(newVal) {
            this.item.end = parseFloat(newVal);
        },
        'stimulus.Pattern': function(newVal) {
            this.item.content = newVal;
            this.item.className = newVal;
            this.cleanStimulus();
        },
        'stimulus.Target': function(newVal) {
            this.item.group = newVal;
            this.stimulus.Target = newVal;
        },
    },
};
</script>

