<template>
    <div class="stimulation-timeline">
        <span class="targets-label" title="Targets of the stimulus">Targets</span>
        <edit-buttons class="edit-buttons"
            @itemAdd="itemAdd"
            @itemDelete="itemDelete"
            @itemEdit="itemEdit"></edit-buttons>
        <div id="visualization" class="visualization"></div>

        <modal :show="showModal" @changeModalVisibility="toggleModal">
            <h3 slot="header">Edit Stimulus</h3>
            <div slot="content">
                <stimulation-form :editableItem="editableItem" @changeModalVisibility="toggleModal"
                @editItem="editItem"></stimulation-form>
            </div>
        </modal>

        <span class="tooltip-span"></span> <!-- tooltip hover item -->
    </div>
</template>

<script>
import Modal from 'components/shared/modal-component.vue';
import StimulationForm from 'components/run-simulation/stimulation/stimulation-form.vue';
import mixin from 'mixins/simulationTimeline.js';
import EditButtons from 'components/run-simulation/edit-buttons.vue';
import 'assets/css/run-simulation.css';
export default {
    'name': 'stimulation-timeline',
    'props': ['endTime', 'forwardSkip', 'blueConfig'],
    'mixins': [mixin],
    'data': function() {
        return {
            'timeline': undefined,
            'config': this.blueConfig,
            'groups': [],
            'items': [],
            'showModal': false,
            'editableItem': {},
            'tooltipElem': undefined,
        };
    },
    'components': {
        'modal': Modal,
        'stimulation-form': StimulationForm,
        'edit-buttons': EditButtons,
    },
    'methods': {
        'onUpdate': function(item, callback) {
            this.editableItem = {'item': item, 'callback': callback};
            this.showModal = true;
        },
        'checkMove': function(item, callback) {
            // check if the item was changed from group. If so open the edit page
            if (item.group !== item.stimulusInfo.Target) {
                item.stimulusInfo.Target = item.group;
                // this.onUpdate(item, callback);
                this.editItem({'item': item, 'callback': callback});
            } else {
                callback(item);
            }
        },
        'updateTimes': function(item) {
            // this will sync the item that was edited with the stimulus inside this item
            try {
                item.start = item.start.getTime();
                item.end = item.end.getTime();
            } catch (e) {};
            item.stimulusInfo.Delay = item.start;
            item.stimulusInfo.Duration = item.end;
        },
        'syncObjectInfoWithItemTime': function(item) {
            /* put the information from the information stimulus in the item to conserve the position */
            try {
                item.start = item.stimulusInfo.Delay;
                item.end = item.stimulusInfo.Duration;
            } catch (e) {
                console.error('Unable to put the stimulus time in item');
            };
        },
        'createNewItem': function(newItem, callback) {
            let stimInfo = Object.assign({}, this.createNewStimulus());
            if (newItem) {
                stimInfo.Target = newItem.group;
                if (newItem.start) {
                    stimInfo.Delay = newItem.start.getTime();
                }
            }
            let id = this.getItemId();
            if (newItem && newItem.start > newItem.end) {
                newItem.end = newItem.start + 10;
                stimInfo.Duration = newItem.end;
            }

            let newObj = this.createItem(
                id,
                stimInfo.Target,
                stimInfo.Pattern,
                stimInfo.Delay,
                stimInfo.Duration,
                stimInfo
            );

            // this will return into the editItem function in the mixin
            this.editableItem = {'item': newObj, 'callback': callback};
            this.showModal = true;
        },
        'createItem': function(id, group, content, start, end, stimulusInfo) {
            return {
                'id': id,
                'group': group,
                'content': content,
                'start': start,
                'end': end,
                'className': content,
                'stimulusInfo': stimulusInfo,
            };
        },
        'createNewStimulus': function() {
            let stim = {};
            stim.Pattern = 'Poisson';
            stim.Target = 'slice-4';
            stim.Mode = 'Current';
            stim.Duration = parseInt(this.endTime);
            stim.Delay = 0;
            stim.Lambda = 5;
            stim.Weight = 0.2;
            stim.NumOfSynapses = 10;
            return stim;
        },
        'createTooltip': function(event) {
            // comes from the timeline.on('itemover')
            let item = this.timeline.itemsData.get(event.item);
            let stimInfo = item.stimulusInfo;
            let output = [];
            switch (stimInfo.Pattern) {
            case 'Poisson':
                output.push(`Lambda: ${stimInfo.Lambda}`);
                output.push(`Weight: ${stimInfo.Weight}`);
                output.push(`Number of synapses: ${stimInfo.NumOfSynapses}`);
                break;
            }
            if (output.length > 0) {
                this.showTooltip(event, output.join('\n'));
            }
        },
        'createConfig': function(config) {
            // clean the default configuration file
            config['Stimulus'] = {};
            config['StimulusInject'] = {};
            for (let i=0; i<this.items.length; i++) {
                // fill stimulus
                let stimulus = Object.assign({}, this.items[i].stimulusInfo);
                // workarounds for the GUI to match the user.target and BlueConfig
                if (stimulus.Pattern === 'Poisson') {
                    stimulus.Pattern = 'NPoisson';
                }
                if (stimulus.Target === 'FullCA1') {
                    stimulus.Target = 'Mosaic';
                }
                let target = stimulus.Target;
                delete stimulus.Target;
                let stimName = this.changeConnectionName(stimulus.Pattern, 'stimulus', i);
                config['Stimulus'][stimName] = stimulus;
                // fill stimulusinject
                let stimInjName = this.changeConnectionName(target, 'stimulusinject', i);
                config['StimulusInject'][stimInjName] = {
                    'Stimulus': stimName,
                    'Target': target,
                };
            }
            return config;
        },
    },
    'mounted': function() {
        let stimulus = this.createNewStimulus();
        let item = this.createItem(
            0, // id
            stimulus.Target,
            stimulus.Pattern,
            stimulus.Delay,
            stimulus.Duration, // TODO: change this to duration
            stimulus
        );
        this.setupGroups(stimulus.Target);
        this.items.push(item);
        this.createTimeline(); // from the simulationTimeline.js

        this.$parent.$on('stimulationTargetSelected', (target) => {
            this.itemAdd({'group': target.name});
        });
    },
    'watch': {
        'endTime': function(newVal) {
            this.timeline.setCustomTime(parseInt(newVal), 'end');
            this.createCustomTimeLabel(); // from the simulation.js
        },
    },
};
</script>

