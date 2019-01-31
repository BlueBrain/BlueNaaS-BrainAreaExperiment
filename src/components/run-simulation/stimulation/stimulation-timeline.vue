
<template>
  <div class="stimulation-timeline">
    <div
      class="timeline-target-container"
      :class="{'available': showTargetSelector}"
    >
      <div class="timeline-container">
        <edit-buttons
          class="edit-buttons"
          @itemAdd="onAdd"
          @itemDelete="onRemove"
          @itemEdit="onUpdate"
        />
        <div
          id="stimulationContainer"
          class="stimulation-container"
        />
      </div>

      <target-selection
        v-if="showTargetSelector"
        :itemsAvailable="stimulationTargets"
        @targetSelected="targetSelected"
      />
    </div>

    <stimulation-form
      :show-modal="showModal"
      :stimulus-info="editableStimulusInfo"
      @itemEdited="stimulusEdited"
      @hideModal="toggleModal"
    />

    <span class="tooltip-span"/> <!-- tooltip hover item -->
  </div>
</template>


<script>
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';

import StimulationForm from '@/components/run-simulation/stimulation/stimulation-form.vue';
import EditButtons from '@/components/run-simulation/edit-buttons.vue';
import TargetSelection from '@/components/shared/target-selection.vue';
import simTimelineLib from '@/services/helper/timeline-helper';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms, unmapBlueConfigTerms } from '@/common/utils';
import db from '@/services/db';

export default {
  name: 'StimulationTimeline',
  components: {
    StimulationForm,
    EditButtons,
    TargetSelection,
  },
  data() {
    return {
      timeline: null,
      showModal: false,
      editableItem: {},
      tooltipElem: null,
    };
  },
  computed: {
    editableStimulusInfo() {
      const stimulus = get(this, 'editableItem.item.stimulusInfo');
      return cloneDeep(stimulus) || {};
    },
    showTargetSelector() {
      return get(this, '$store.state.stimulationTargets.length');
    },
    stimulationTargets() {
      return this.$store.state.stimulationTargets;
    },
  },
  async mounted() {
    const savedItems = await this.loadPreviousConfig(); // if there is prev load otherwise, create

    const timelineElem = this.$el.querySelector('#stimulationContainer');
    const eventsObj = {
      onAdd: this.onAdd,
      onMove: this.onMove,
      onRemove: this.onRemove,
      onUpdate: this.onUpdate,
    };
    this.timeline = simTimelineLib.createTimeline(timelineElem, eventsObj);
    this.timeline.setItems(new simTimelineLib.DataSet(savedItems));

    // tooltip section
    this.tooltipElem = this.$el.querySelector('.tooltip-span');
    this.timeline.on('itemover', this.createTooltip);
    this.timeline.on('itemout', () => {
      this.tooltipElem.style.display = 'none';
    });

    // before running the simulation create BlueConfig
    eventBus.$on('createStimulusConfig', (resolve) => {
      const stimulusBlueConfig = this.createConfig();
      resolve(stimulusBlueConfig);
    });
    eventBus.$on('simulationDurationChanged', (newDuration) => {
      this.timeline.setCustomTime(newDuration, 'end');
    });
  },
  methods: {
    onAdd(item, callback) {
      const oldItem = item || null;
      this.createNewItem(oldItem, callback);
    },

    onMove(item, callback) {
      this.updateTimes(item, callback);
    },

    onRemove(item) {
      simTimelineLib.deleteItem(item, this);
    },

    onUpdate(item, callback) {
      simTimelineLib.updatedItem(item, callback, this);
    },

    updateTimes(item, callback) {
      // this will sync the item that was edited with the stimulus inside this item
      const updatedItem = item;
      updatedItem.start = item.start.getTime();
      updatedItem.end = item.end.getTime();
      updatedItem.stimulusInfo.Delay = item.start;
      updatedItem.stimulusInfo.Duration = item.end;
      callback(updatedItem);
    },

    toggleModal(value) {
      this.showModal = value || !this.showModal;
    },

    stimulusEdited(editedItem) {
      this.editableItem.item.stimulusInfo = editedItem;
      this.editableItem.item = this.syncItemWithStimulus(this.editableItem.item);
      // continue editing the item with shared functions
      simTimelineLib.editItem(this);
    },

    syncItemWithStimulus(item) {
      /* put the information from the information stimulus
         in the item to conserve the position */
      const modifiedItem = item;
      modifiedItem.start = item.stimulusInfo.Delay;
      modifiedItem.end = item.stimulusInfo.Duration;
      modifiedItem.content = `${item.stimulusInfo.Target} (${item.stimulusInfo.Pattern})`;
      return modifiedItem;
    },

    createNewItem(newItem, callback) {
      const stimInfo = Object.assign({}, this.createNewStimulus());
      const id = simTimelineLib.getItemId(this.timeline.itemsData);

      const newObj = this.createItem(
        id,
        stimInfo.Target,
        stimInfo.Pattern,
        stimInfo.Delay,
        stimInfo.Duration,
        stimInfo,
      );

      // object to be passed to the modal to edit
      this.editableItem = { item: newObj, callback };
      this.showModal = true;
    },

    createItem(id, target, pattern, start, end, stimulusInfo) {
      return {
        id,
        content: `${target} (${pattern})`,
        className: pattern,
        start,
        end,
        stimulusInfo,
      };
    },
    createNewStimulus(target = null) {
      return {
        Pattern: 'Poisson',
        Target: target || this.$store.state.simulationPopulation,
        Mode: 'Current',
        Duration: parseInt(this.$store.state.simulationDuration, 10),
        Delay: 0,
        Lambda: 5,
        Weight: 0.2,
        NumOfSynapses: 10,
      };
    },

    createTooltip(event) {
      // comes from the timeline.on('itemover')
      const item = this.timeline.itemsData.get(event.item);
      const { stimulusInfo } = item;
      const output = [];
      switch (stimulusInfo.Pattern) {
        case 'Poisson':
          output.push(`Pattern: ${stimulusInfo.Pattern}`);
          output.push(`Lambda: ${stimulusInfo.Lambda}`);
          output.push(`Weight: ${stimulusInfo.Weight}`);
          output.push(`Number of synapses: ${stimulusInfo.NumOfSynapses}`);
          break;
        default:
          break;
      }
      if (output.length > 0) {
        simTimelineLib.showTooltip(event, output.join('\n'), this.tooltipElem);
      }
    },

    createConfig() {
      const config = {};
      config.Stimulus = {};
      config.StimulusInject = {};
      const stimulationItems = this.timeline.getVisibleItems();
      stimulationItems.forEach((stimulusName, index) => {
        const stimObj = this.timeline.itemsData.get(stimulusName);
        const stimulusMapped = mapBlueConfigTerms(stimObj.stimulusInfo);
        const target = stimulusMapped.Target;
        delete stimulusMapped.Target;
        // fill stimulus
        const stimName = simTimelineLib.joinName(
          stimulusMapped.Pattern,
          'stimulus',
          index,
        );
        config.Stimulus[stimName] = stimulusMapped;
        // fill stimulusinject
        const stimInjName = simTimelineLib.joinName(
          target,
          'stimulusinject',
          index,
        );
        config.StimulusInject[stimInjName] = {
          Stimulus: stimName,
          Target: target,
        };
      });
      return config;
    },

    setNewItem(newItem, id = 0) {
      return this.createItem(
        id,
        newItem.Target,
        newItem.Pattern,
        newItem.Delay,
        newItem.Duration,
        newItem,
      );
    },

    async loadPreviousConfig() {
      const lastConfig = await db.retrievePreviousConfig();
      if (!lastConfig || !lastConfig.bc || !lastConfig.bc.StimulusInject) {
        return [this.setNewItem(this.createNewStimulus())];
      }
      const prevItems = [];
      forEach(lastConfig.bc.StimulusInject, (stimulusInjectObj, stimulusInjectKey) => {
        const stimulusInfo = lastConfig.bc.Stimulus[stimulusInjectObj.Stimulus];
        const target = { Target: stimulusInjectObj.Target };
        const prevStimulus = unmapBlueConfigTerms(Object.assign({}, target, stimulusInfo));
        prevItems.push(this.setNewItem(prevStimulus, stimulusInjectKey));
      });
      return prevItems;
    },
    targetSelected(target) {
      const id = simTimelineLib.getMaxId(this.timeline.itemsData) || 1;
      const newStim = this.setNewItem(this.createNewStimulus(target.displayName), id);
      this.timeline.itemsData.add(newStim);
    },
  },
  beforeDestroy() {
    eventBus.$off('createStimulusConfig');
  },
};
</script>
