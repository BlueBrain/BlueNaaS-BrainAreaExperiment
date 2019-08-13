
<template>
  <div class="report-timeline">
    <div
      class="timeline-target-container"
      :class="{'available': showTargetSelector}"
    >
      <div class="timeline-container">
        <edit-buttons
          class="edit-buttons"
          @item-add="onAdd"
          @item-delete="onRemove"
          @item-edit="onUpdate"
        />
        <div
          id="reportContainer"
          class="report-container"
        />
      </div>

      <target-selection
        v-if="showTargetSelector"
        :itemsAvailable="reportTargets"
        @target-selected="targetSelected"
      />
    </div>

    <report-form
      :show-modal="showModal"
      :report-info="editableReportInfo"
      @item-edited="reportEdited"
      @hide-modal="toggleModal(false)"
    />

    <span class="tooltip-span"/> <!-- tooltip hover item -->
  </div>
</template>


<script>
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';

import ReportForm from '@/components/run-simulation/report/report-form.vue';
import EditButtons from '@/components/run-simulation/edit-buttons.vue';
import TargetSelection from '@/components/shared/target-selection.vue';
import simTimelineLib from '@/services/helper/timeline-helper';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms, unmapBlueConfigTerms } from '@/common/utils';
import db from '@/services/db';

export default {
  name: 'ReportTimeline',
  components: {
    ReportForm,
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
    editableReportInfo() {
      const report = get(this, 'editableItem.item.reportInfo');
      return cloneDeep(report) || {};
    },
    showTargetSelector() {
      return get(this, '$store.state.reportTargets.length');
    },
    reportTargets() {
      return this.$store.state.reportTargets;
    },
  },
  async mounted() {
    const savedItems = await this.loadPreviousConfig(); // if there is prev load otherwise, create
    const timelineElem = this.$el.querySelector('#reportContainer');
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
    this.creationConfigHandlerBinded = this.creationConfigHandler.bind(this);
    this.simulationDurationChangedBinded = this.simulationDurationChanged.bind(this);
    eventBus.$on('createReportConfig', this.creationConfigHandlerBinded);
    eventBus.$on('simulationDurationChanged', this.simulationDurationChangedBinded);
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

    creationConfigHandler(resolve) {
      const reportBlueConfig = this.createConfig();
      resolve(reportBlueConfig);
    },
    simulationDurationChanged(newDuration) {
      this.timeline.setCustomTime(newDuration, 'end');
    },

    reportEdited(editedItem) {
      this.editableItem.item.reportInfo = editedItem;
      this.editableItem.item = this.syncItemWithReport(this.editableItem.item);
      // continue editing the item with shared functions
      simTimelineLib.editItem(this);
    },

    updateTimes(item, callback) {
      // this will sync the item that was edited with the report inside this item
      const updatedItem = item;
      updatedItem.start = item.start.getTime();
      updatedItem.end = item.end.getTime();
      updatedItem.reportInfo.StartTime = item.start;
      updatedItem.reportInfo.EndTime = item.end;
      callback(updatedItem);
    },

    syncItemWithReport(item) {
      /* put the information from the information report in the item to conserve the position */
      const modifiedItem = item;
      modifiedItem.start = item.reportInfo.StartTime;
      modifiedItem.end = item.reportInfo.EndTime;
      modifiedItem.content = `${item.reportInfo.Target} (${item.reportInfo.ReportOn})`;
      return modifiedItem;
    },

    toggleModal(value) {
      this.showModal = value || !this.showModal;
    },

    createNewItem(newItem, callback) {
      const id = simTimelineLib.getItemId(this.timeline.itemsData);
      const newObj = this.createItem(
        this.createNewReport(),
        id,
      );
      this.editableItem = { item: newObj, callback };
      this.showModal = true;
    },

    removeFromConfig(item) {
      delete this.config.Report[item.connection];
    },

    createNewReport(target) {
      return {
        StartTime: 0,
        EndTime: parseInt(this.$store.state.simulationDuration, 10),
        ReportOn: 'Voltage',
        Unit: 'mV',
        Target: target || this.$store.state.simulationPopulation,
        Type: 'Soma',
        Format: 'Bin',
        Dt: 0.1,
      };
    },

    createTooltip(event) {
      // comes from the timeline.on('itemover')
      const item = this.timeline.itemsData.get(event.item);
      const { reportInfo } = item;
      const output = [];
      output.push(`Dt: ${reportInfo.Dt}`);
      output.push(`Type: ${reportInfo.Type}`);
      output.push(`ReportOn: ${reportInfo.ReportOn}`);
      if (reportInfo.Scaling) {
        output.push(`Scaling: ${reportInfo.Scaling}`);
      }
      if (output.length > 0) {
        simTimelineLib.showTooltip(event, output.join('\n'), this.tooltipElem);
      }
    },

    getReportUnit(reportMapped) {
      let unit = '';
      switch (reportMapped.ReportOn) {
        case 'cai':
          unit = 'mM';
          break;
        case 'i_membrane IClamp':
          unit = 'nA';
          break;
        default:
          unit = 'mV';
      }
      return unit;
    },

    createConfig() {
      const config = {};
      config.Report = {};
      const reportItems = this.timeline.getVisibleItems();
      reportItems.forEach((reportName, index) => {
        const reportObj = this.timeline.itemsData.get(reportName);
        const reportMapped = mapBlueConfigTerms(reportObj.reportInfo);
        const repName = simTimelineLib.joinName(
          reportMapped.Target,
          'report',
          index,
        );
        reportMapped.Unit = this.getReportUnit(reportMapped);
        config.Report[repName] = reportMapped;
      });
      return config;
    },

    createItem(newItem, id = 0) {
      return {
        id,
        content: `${newItem.Target} (${newItem.ReportOn})`,
        start: newItem.StartTime,
        end: newItem.EndTime,
        className: newItem.ReportOn,
        reportInfo: newItem,
      };
    },

    async loadPreviousConfig() {
      const lastConfig = await db.retrievePreviousConfig();
      if (!lastConfig || !lastConfig.bc || !lastConfig.bc.Report) {
        return [this.createItem(this.createNewReport())];
      }
      const prevItems = [];
      let index = 0;
      forEach(lastConfig.bc.Report, (report) => {
        const prevReport = unmapBlueConfigTerms(report);
        prevItems.push(this.createItem(prevReport, index));
        index += 1;
      });

      return prevItems;
    },
    targetSelected(target) {
      const id = simTimelineLib.getMaxId(this.timeline.itemsData) || 0;
      const newStim = this.createItem(this.createNewReport(target.displayName), id);
      this.timeline.itemsData.add(newStim);
    },
  },
  beforeDestroy() {
    eventBus.$off('createReportConfig', this.creationConfigHandlerBinded);
    eventBus.$off('simulationDurationChanged', this.simulationDurationChangedBinded);
  },
};
</script>
