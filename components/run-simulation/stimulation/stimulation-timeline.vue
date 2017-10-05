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
        <span class="custom-time-label">End</span> <!-- custom time label -->
    </div>
</template>

<script>
import modal from 'components/shared/modal-component.vue';
import StimulationForm from 'components/run-simulation/stimulation/stimulation-form.vue';
import mixin from 'mixins/simulationTimeline.js';
import EditButtons from 'components/run-simulation/edit-buttons.vue';
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
        'modal': modal,
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
            stim.Target = 'FullCA1';
            stim.Mode = 'Current';
            stim.Duration = parseInt(this.endTime);
            stim.Delay = 0;
            stim.Lambda = 5;
            stim.Weight = 0.2;
            stim.NumOfSynapses = 10;
            // stim.SynapseType = 50;
            return stim;
        },
        'createTooltip': function(event) {
            // comes from the timeline.on('itemover')
            let item = this.timeline.itemsData.get(event.item);
            let stimInfo = item.stimulusInfo;
            let output = [];
            switch (stimInfo.Pattern) {
            // case 'Linear':
            // case 'RelativeLinear':
            //     output.push(`AmpStart: ${stimInfo.AmpStart} mA`);
            //     output.push(`AmpEnd: ${stimInfo.AmpEnd} mA`);
            //     break;
            case 'NPoisson':
            // case 'NPoissonInhomogenous':
                output.push(`Lambda: ${stimInfo.Lambda}`);
                output.push(`Weight: ${stimInfo.Weight}`);
                output.push(`Number of synapses: ${stimInfo.NumOfSynapses}`);
                break;
            // case 'Pulse':
            //     output.push(`Width: ${stimInfo.Width} ms`);
            //     output.push(`Frequency: ${stimInfo.Frequency}`);
            //     output.push(`Offset: ${stimInfo.Offset}`);
            //     break;
            // case 'Noise':
            //     output.push(`Mean: ${stimInfo.Mean} mA`);
            //     output.push(`Mean Percent: ${stimInfo.MeanPercent}`);
            //     output.push(`Variance: ${stimInfo.Variance}`);
            //     break;
            // case 'Hyperpolarizing':
            //     output.push('Hyperpolarizing');
            //     break;
            // case 'SubThreshold':
            //     output.push('SubThreshold');
            //     break;
            // case 'SynapseReplay':
            //     output.push(`Spike File: ${stimInfo.SpikeFile}`);
            //     break;
            // case 'ReplayVoltageTrace':
            //     output.push(`H5 File: ${stimInfo.H5File}`);
            //     output.push(`Dataset label: ${opover.DataSetLabel}`);
            //     break;
            // case 'SEClamp':
            //     output.push(`Voltage: ${stimInfo.Voltage} mV`);
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
                let stimulus = this.items[i].stimulusInfo;
                // workarounds for the GUI to match the user.target and BlueConfig
                if (stimulus.Pattern === 'Poisson') {
                    stimulus.Pattern = 'NPoisson';
                }
                if (stimulus.Target === 'FullCA1') {
                    stimulus.Target = 'Mosaic';
                }
                let stimName = this.changeConnectionName(stimulus.Pattern, 'stimulus', i);
                config['Stimulus'][stimName] = stimulus;
                // fill stimulusinject
                let stimInjName = this.changeConnectionName(stimulus.Target, 'stimulusinject', i);
                config['StimulusInject'][stimInjName] = {
                    'Stimulus': stimName,
                    'Target': stimulus.Target,
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
        'endTime': function(newVal, oldVal) {
            let newValInt = parseInt(newVal);
            this.timeline.setCustomTime(newValInt, 'end');
            this.createCustomTimeLabel(); // from the simulation.js
        },
    },
};
</script>

<style scoped>
    .home {
      margin-bottom: 40px;
    }
    .visualization {
        margin-top: 5px;
    }
    .targets-label {
        position: relative;
        top: 35px;
    }
</style>

<style>
    /* hide line and dot to the time */
    .stimulation-timeline .vis-item.vis-line.vis-editable {
        display: none;
    }
    .stimulation-timeline .vis-item.vis-dot.vis-editable {
        display: none;
    }
    .stimulation-timeline .vis-item.Hyperpolarizing {
        background-color: #E5F6D5;
        border-color: #B1E480;
    }
    .stimulation-timeline .vis-item.Linear {
        background-color: #D5E4F6;
        border-color: #80AEE4;
    }
    .stimulation-timeline .vis-item.RelativeLinear {
        background-color: #D5F6DD;
        border-color: #80E498;
    }
    .stimulation-timeline .vis-item.Pulse {
        background-color: #D5F5F6;
        border-color: #80E1E4;
    }
    .stimulation-timeline .vis-item.NPoissonInhomogenous {
        background-color: #F6DCD5;
        border-color: #E48380;
    }
    .stimulation-timeline .vis-item.ReplayVoltageTrace {
        background-color: #F6D5F5;
        border-color: #80AEE4;
    }
    .stimulation-timeline .vis-item.SEClamp {
        background-color: #EA97BC;
        border-color: #8C5A70;
    }
    .stimulation-timeline .vis-item.Subthreshold {
        background-color: #F6E6D5;
        border-color: #E4B480;
    }
    .stimulation-timeline .vis-item.SynapseReplay {
        background-color: #F9A3EE;
        border-color: #F243DC;
    }

    .stimulation-timeline .vis-custom-time.end {
        background-color: #FF7F6E;
        width: 2px;
        pointer-events: none;
    }
    .stimulation-timeline .vis-item.vis-selected {
        -webkit-transition: background-color 0.25s linear;
        border-color: #FFC200;
        background-color: #FFF785;
        z-index: 2;
    }
    .stimulation-timeline .tooltip-span {
        z-index: 2;
        background-color: #8393b7;
        color: white;
        border-radius: 7px;
        font-size: 14px;
        padding: 8px;
        display: none;
        position: fixed;
    }
    .stimulation-timeline .vis-label {
        width: 100px;
    }
    .custom-time-label {
        position: relative;
        background-color: #ff7f6e;
        border-radius: 5px 0 5px 5px;
        padding: 3px;
        top: 3px;
    }
    .stimulation-timeline .vis-panel {
        box-sizing: content-box;
    }
</style>
