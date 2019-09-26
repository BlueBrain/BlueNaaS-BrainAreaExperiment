
<template>
  <div class="stimulation-timeline manipulation-section">
    <div class="in-corner">
      <icon
        class="toggle-arrow"
        :class="{ 'inverted': sectionCollapsed }"
        type="ios-arrow-down"
        @click="sectionCollapsed = !sectionCollapsed"
      />
    </div>
    <h2>Stimulations</h2>
    <div class="subtitle">Defines pattern of stimuli to be injected into multiple locations</div>

    <div
      class="custom-collapsable-section"
      :class="{ 'section-collapsed': sectionCollapsed }"
    >
      <div
        class="timeline-target-container"
        :class="{ 'loading': isTimelineLoading }"
      >
        <div class="timeline-container">
          <edit-buttons
            class="edit-buttons"
            @item-add="onAdd"
            @item-delete="onRemove"
            @item-edit="onUpdate"
          />
          <div
            id="stimulationContainer"
            class="stimulation-container custom-changed-timeline"
          />
        </div>
      </div>

      <stimulation-form
        :show-modal="showModal"
        :stimulus-info="editableStimulusInfo"
        @item-edited="stimulusEdited"
        @hide-modal="toggleModal"
      />

      <span class="tooltip-span"/> <!-- tooltip hover item -->
    </div>
  </div>
</template>


<script>
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import StimulationForm from '@/components/run-simulation/stimulation/stimulation-form.vue';
import EditButtons from '@/components/run-simulation/edit-buttons.vue';
import simTimelineLib from '@/services/helper/timeline-helper';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms } from '@/common/utils';
import constants from '@/common/constants';
import db from '@/services/db';

export default {
  name: 'StimulationTimeline',
  components: {
    StimulationForm,
    EditButtons,
  },
  data() {
    return {
      timeline: null,
      showModal: false,
      editableItem: {},
      tooltipElem: null,
      sectionCollapsed: true,
      isTimelineLoading: true,
    };
  },
  computed: {
    editableStimulusInfo() {
      const stimulus = get(this, 'editableItem.item.stimulusInfo');
      return cloneDeep(stimulus) || {};
    },
  },
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setSimulationPopulation' && state.simulationPopulation) {
        this.createTimelineOnExpand();
      }
    });
    // before running the simulation create BlueConfig
    this.creationConfigHandlerBinded = this.creationConfigHandler.bind(this);
    this.simulationDurationChangedBinded = this.simulationDurationChanged.bind(this);
    eventBus.$on('create-stimulus-config', this.creationConfigHandlerBinded);
    eventBus.$on('simulation-duration-changed', this.simulationDurationChangedBinded);
  },
  methods: {
    async createTimelineOnExpand() {
      this.isTimelineLoading = true;
      const savedItems = await this.loadPreviousConfig(); // if there is prev load otherwise, create

      const timelineElem = this.$el.querySelector('#stimulationContainer');
      timelineElem.innerHTML = '';
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

      setTimeout(() => {
        // to add transition effect
        this.isTimelineLoading = false;
        this.sectionCollapsed = false;
      }, 1000);
    },
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

    creationConfigHandler(resolve) {
      const stimulusBlueConfig = this.createConfig();
      resolve(stimulusBlueConfig);
    },

    simulationDurationChanged(newDuration) {
      if (!this.timeline) return;
      this.timeline.setCustomTime(newDuration, 'end');
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
      const id = simTimelineLib.getItemId(this.timeline.itemsData);
      const newObj = this.createItem(
        this.createNewStimulus(),
        id,
      );
      // object to be passed to the modal to edit
      this.editableItem = { item: newObj, callback };
      this.showModal = true;
    },

    createItem(newItem, id = 0) {
      return {
        id,
        content: `${newItem.Target} (${newItem.Pattern})`,
        className: newItem.Pattern,
        start: newItem.Delay,
        end: newItem.Duration,
        stimulusInfo: newItem,
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
        Weight: 1,
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
      let config = {};
      const configToSave = [];
      config.Stimulus = {};
      config.StimulusInject = {};
      const stimulationItems = this.timeline.getVisibleItems();
      stimulationItems.forEach((stimulusName, index) => {
        const stimObj = this.timeline.itemsData.get(stimulusName);
        configToSave.push(stimObj);
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
      db.setSavedConfig(constants.saveParamNames.STIMULATION, configToSave);

      // if Noise stimulus -> Hyperpolarizing
      const stims = Object.keys(config.Stimulus);
      const hasNoise = !!stims.find(s => s.includes('Noise_'));
      if (hasNoise) {
        config = merge(this.$store.state.currentCircuitConfig.hipperpolarizingStim, config);
      }

      return config;
    },

    async loadPreviousConfig() {
      const targetSame = await simTimelineLib.isCurrentSameAsSavedTarget();
      const savedConfig = await db.getSavedConfig(constants.saveParamNames.STIMULATION);
      if (!savedConfig || !targetSame) {
        return [this.createItem(this.createNewStimulus())];
      }
      return savedConfig;
    },
    targetSelected(target) {
      const id = simTimelineLib.getMaxId(this.timeline.itemsData) || 0;
      const newStim = this.createItem(this.createNewStimulus(target.displayName), id);
      this.timeline.itemsData.add(newStim);
    },
  },
  beforeDestroy() {
    eventBus.$off('create-stimulus-config', this.creationConfigHandlerBinded);
    eventBus.$off('simulation-duration-changed', this.simulationDurationChangedBinded);
  },
};
</script>
