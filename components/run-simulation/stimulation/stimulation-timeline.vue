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
                <stimulation-form :stimulusEditableObject="stimulusEditableObject" @changeModalVisibility="toggleModal"
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
            'stimulusEditableObject': {},
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
            let a = {};
            let stimInjObj = this.config.StimulusInject[item.stimulusInjectName];
            if (stimInjObj) {
                let stimulusName = stimInjObj.Stimulus;
                a.item = item;
                a.stimulusInfo = this.config.Stimulus[stimulusName];
                a.callback = callback;
                this.stimulusEditableObject = a;
                this.showModal = true;
            }
        },
        'updateTimes': function(item) {
            // this will change the item and config with the delay and duration in (ms)
            let start = item.start.getTime();
            let end = item.end.getTime();
            let connectionObj = this.config.StimulusInject[item.stimulusInjectName];
            if (connectionObj) {
                let itemStimName = connectionObj.Stimulus;
                let itemStimObj = this.config.Stimulus[itemStimName];
                item.start = itemStimObj.Delay = start;
                item.end = itemStimObj.Duration = end;
            }
            this.updateOrAdd(this.items, item);
        },
        'changeContentAndGroup': function(editedItem) {
            let newPattern = editedItem.stimulus.Pattern;
            // let oldPattern = editedItem.item.content;
            let newTarget = editedItem.item.group;
            // let oldTarget = this.config.StimulusInject[editedItem.item.stimulusInjectName].Target;
            let oldStimName = editedItem.item.stimulusName;
            let oldStimInjName = editedItem.item.stimulusInjectName;

            let newStimInjectObj = Object.assign({}, this.config.StimulusInject[oldStimInjName]);
            let newStimObj = Object.assign({}, this.config.Stimulus[oldStimName]);
            let newStimName = this.changeConnectionName(newPattern, 'stimulus', editedItem.item.id);
            let newStimInjName = this.changeConnectionName(newTarget, 'stimulusinject', editedItem.item.id);
            newStimInjectObj.Stimulus = newStimName;
            this.config.StimulusInject[newStimInjName] = newStimInjectObj;
            this.config.Stimulus[newStimName] = newStimObj;
            editedItem.item.stimulusInjectName = newStimInjName;
            editedItem.item.stimulusName = newStimName;
            editedItem.item.className = newStimObj.Pattern;

            if (oldStimName !== newStimName) {
                delete this.config.Stimulus[oldStimName];
            }
            if (oldStimInjName !== newStimInjName) {
                let newGroup = this.setupGroups(newTarget);
                if (newGroup) {
                    this.timeline.groupsData.getDataSet().add(newGroup);
                }
                delete this.config.StimulusInject[oldStimInjName];
            }
        },
        'cloneAndCreateItem': function(newItem) {
            let stimInfo = undefined;
            let stimName = undefined;
            let connectionKey = undefined;
            let stimInjectObj = undefined;

            if (!newItem) {
                stimInfo = Object.assign({}, this.createNewStimulus());
                newItem = {};
                newItem.group = 'L5_TTPC1';
                stimName = 'Linear_stimulus_0';
                connectionKey = 'L5_TTPC1_stimulusinject_0';
                stimInjectObj = {
                    'Stimulus': connectionKey,
                    'Target': newItem.group,
                };
            } else {
                stimInjectObj = Object.assign({}, this.config.StimulusInject[newItem.stimulusInjectName]);
                stimName = stimInjectObj.Stimulus;
                connectionKey = newItem.stimulusInjectName;
                stimInfo = Object.assign({}, this.config.Stimulus[stimName]);
                stimInfo.Delay = newItem.start;
                stimInfo.Duration = newItem.end;
            }

            let id = this.getItemId();
            if (newItem.start > newItem.end) {
                newItem.end = newItem.start + 10;
                stimInfo.Duration = newItem.end;
            }

            let newObj = this.createNewItem(
                id,
                newItem.group,
                stimInfo.Pattern,
                stimInfo.Delay,
                stimInfo.Duration,
                // this will transform for example "Linear_stimulus_0" to "Noise_stimulus_1"
                this.changeConnectionName(stimInfo.Pattern, 'stimulus', this.items.length),
                this.changeConnectionName(newItem.group, 'stimulusinject', this.items.length)
            );

            this.config.Stimulus[newObj.stimulusName] = stimInfo;

            this.config.StimulusInject[newObj.stimulusInjectName] = {
                'Stimulus': newObj.stimulusName,
                'Target': newItem.group,
            };

            let a = {};
            let stimInjObj = this.config.StimulusInject[newObj.stimulusInjectName];
            if (stimInjObj) {
                let stimulusName = stimInjObj.Stimulus;
                a.item = newObj;
                a.stimulusInfo = this.config.Stimulus[stimulusName];
                a.callback = undefined;
                this.stimulusEditableObject = a;
                this.showModal = true;
            }
        },
        'createNewItem': function(id, group, content, start, end, stimulusName, stimulusInjectName) {
            return {
                'id': id,
                'group': group,
                'content': content,
                'start': start,
                'end': end,
                'stimulusName': stimulusName,
                'stimulusInjectName': stimulusInjectName,
                'className': content,
            };
        },
        'removeFromConfig': function(item) {
            delete this.config.Stimulus[item.stimulusName];
            delete this.config.StimulusInject[item.stimulusInjectName];
        },
        'createNewStimulus': function() {
            let stim = {};
            stim.Pattern = 'Linear';
            stim.AmpStart = 0;
            stim.AmpEnd = 0;
            stim.Duration = this.endTime;
            stim.Delay = 0;
            // this is the only supported value for stimuli in the editor.
            stim.Mode = 'Current';
            return stim;
        },
        'createTooltip': function(event) {
            // comes from the timeline.on('itemover')
            let item = this.timeline.itemsData.get(event.item);
            let stimInfo = this.config.Stimulus[item.stimulusName];
            let output = [];
            switch (stimInfo.Pattern) {
            case 'Linear':
            case 'RelativeLinear':
                output.push(`AmpStart: ${stimInfo.AmpStart} mA`);
                output.push(`AmpEnd: ${stimInfo.AmpEnd} mA`);
                break;
            case 'NPoisson':
            case 'NPoissonInhomogenous':
                output.push(`Lambda: ${stimInfo.Lambda}`);
                output.push(`Weight: ${stimInfo.Weight}`);
                output.push(`Number of synapses: ${stimInfo.NumOfSynapses}`);
                break;
            case 'Pulse':
                output.push(`Width: ${stimInfo.Width} ms`);
                output.push(`Frequency: ${stimInfo.Frequency}`);
                output.push(`Offset: ${stimInfo.Offset}`);
                break;
            case 'Noise':
                output.push(`Mean: ${stimInfo.Mean} mA`);
                output.push(`Mean Percent: ${stimInfo.MeanPercent}`);
                output.push(`Variance: ${stimInfo.Variance}`);
                break;
            case 'Hyperpolarizing':
                output.push('Hyperpolarizing');
                break;
            case 'SubThreshold':
                output.push('SubThreshold');
                break;
            case 'SynapseReplay':
                output.push(`Spike File: ${stimInfo.SpikeFile}`);
                break;
            case 'ReplayVoltageTrace':
                output.push(`H5 File: ${stimInfo.H5File}`);
                output.push(`Dataset label: ${opover.DataSetLabel}`);
                break;
            case 'SEClamp':
                output.push(`Voltage: ${stimInfo.Voltage} mV`);
            }
            if (output.length > 0) {
                this.showTooltip(event, output.join('\n'));
            }
        },
    },
    'mounted': function() {
        // create a dataset with items
        let stimulusApplied = Object.keys(this.config.StimulusInject);
        for (let i=0; i<stimulusApplied.length; i++) {
            let stimulusInjectName = stimulusApplied[i];
            let stimulusInjectObj = this.config.StimulusInject[stimulusInjectName];
            let stimulusInfo = this.config.Stimulus[stimulusInjectObj.Stimulus];
            let target = stimulusInjectObj.Target;
            this.setupGroups(target);

            let item = this.createNewItem(
                i,
                target,
                stimulusInfo.Pattern,
                stimulusInfo.Delay,
                100, // TODO: change this to duration
                stimulusInjectObj.Stimulus,
                stimulusInjectName
            );

            this.items.push(item);
        }
        this.createTimeline(); // from the simulationTimeline.js

        this.$parent.$on('stimulationTargetSelected', (target) => {
            this.itemAdd(target);
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
