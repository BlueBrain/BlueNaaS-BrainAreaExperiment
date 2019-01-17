
<template>
  <div class="report-timeline">


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
          id="reportContainer"
          class="report-container"
        />
      </div>

      <target-selection
        v-if="showTargetSelector"
        :itemsAvailable="reportTargets"
        @targetSelected="targetSelected"
      />
    </div>

    <report-form
      :show-modal="showModal"
      :report-info="editableReportInfo"
      @itemEdited="reportEdited"
      @hideModal="toggleModal(false)"
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
import { mapBlueConfigTerms, unmapBlueConfigTerms } from '@/assets/utils';
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
    eventBus.$on('createReportConfig', (resolve) => {
      const reportBlueconfig = this.createConfig();
      resolve(reportBlueconfig);
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
      console.log('Report deleted', item);
      simTimelineLib.deleteItem(item, this);
    },

    onUpdate(item, callback) {
      simTimelineLib.updatedItem(item, callback, this);
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

    createItem(id, target, reportOn, start, end, reportInfo) {
      return {
        id,
        content: `${target} (${reportOn})`,
        start,
        end,
        className: reportOn,
        reportInfo,
      };
    },
    createNewItem(newItem, callback) {
      const reportObj = Object.assign({}, this.createNewReport());
      const id = simTimelineLib.getItemId(this.timeline.itemsData);
      const newObj = this.createItem(
        id,
        reportObj.Target,
        reportObj.ReportOn,
        reportObj.StartTime,
        reportObj.EndTime,
        reportObj,
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
        ReportOn: 'voltage',
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

    createConfig() {
      const config = {};
      config.Report = {};
      this.timeline.itemSet.getItems().forEach((report, index) => {
        const reportMapped = mapBlueConfigTerms(report.reportInfo);
        const repName = simTimelineLib.joinName(
          reportMapped.Target,
          'report',
          index,
        );
        config.Report[repName] = reportMapped;
      });
      return config;
    },

    setNewItem(newItem, id = 0) {
      return this.createItem( // id, group, content, start, end, connection
        id,
        newItem.Target,
        newItem.ReportOn,
        newItem.StartTime,
        newItem.EndTime,
        newItem,
      );
    },

    async loadPreviousConfig() {
      const lastConfig = await db.retrievePreviousConfig();
      const prevItems = [];
      try {
        if (lastConfig.bc) {
          let index = 0;
          forEach(lastConfig.bc.Report, (report) => {
            const prevReport = unmapBlueConfigTerms(report);
            prevItems.push(this.setNewItem(prevReport, index));
            index += 1;
          });
        } else { throw String('BlueConfig params missing'); }
        return prevItems;
      } catch (e) {
        console.log('- Previous config for report not found');
        return [this.setNewItem(this.createNewReport())];
      }
    },
    targetSelected(target) {
      const id = simTimelineLib.getMaxId(this.timeline.itemsData) || 1;
      const newStim = this.setNewItem(this.createNewReport(target.displayName), id);
      this.timeline.itemsData.add(newStim);
    },
  },
  beforeDestroy() {
    eventBus.$off('createReportConfig');
  },
};
</script>
