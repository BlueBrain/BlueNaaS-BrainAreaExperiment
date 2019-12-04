
<template>
  <div class="report-timeline manipulation-section">
    <div class="in-corner">
      <icon
        class="toggle-arrow"
        :class="{ 'inverted': sectionCollapsed }"
        type="ios-arrow-down"
        @click="sectionCollapsed = !sectionCollapsed"
      />
    </div>
    <h2>Reports</h2>
    <div class="subtitle">Controls data collection during the simulation</div>

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
            id="reportContainer"
            class="report-container custom-changed-timeline"
          />
        </div>
      </div>

      <report-form
        :show-modal="showModal"
        :report-info="editableReportInfo"
        @item-edited="reportEdited"
        @hide-modal="toggleModal(false)"
      />

      <span class="tooltip-span"/> <!-- tooltip hover item -->
    </div>
  </div>
</template>


<script>
import get from 'lodash/get';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';

import ReportForm from '@/components/run-simulation/report/report-form.vue';
import EditButtons from '@/components/run-simulation/edit-buttons.vue';
import simTimelineLib from '@/services/helper/timeline-helper';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms } from '@/common/utils';
import { saveParamNames } from '@/common/constants';
import db from '@/services/db';

export default {
  name: 'ReportTimeline',
  components: {
    ReportForm,
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
      allCompartmentTargetObj: this.$store.state.currentCircuitConfig.allCompartmentTargetObj,
    };
  },
  computed: {
    editableReportInfo() {
      const report = get(this, 'editableItem.item.reportInfo');
      return cloneDeep(report) || {};
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
    eventBus.$on('create-report-config', this.creationConfigHandlerBinded);
    eventBus.$on('simulation-duration-changed', this.simulationDurationChangedBinded);
  },
  methods: {
    async createTimelineOnExpand() {
      const savedItems = await this.loadPreviousConfig(); // if there is prev load otherwise, create
      const timelineElem = this.$el.querySelector('#reportContainer');
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

    creationConfigHandler(resolve) {
      const reportBlueConfig = this.createConfig();
      resolve(reportBlueConfig);
    },

    simulationDurationChanged(newDuration) {
      if (!this.timeline) return;
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

    createConfig() {
      const config = { Report: {} };
      const configToSave = [];
      const reportOnObj = this.$store.state.currentSimulationConfig.reportOn;
      const reportItems = this.timeline.getVisibleItems();
      reportItems.forEach((reportName, index) => {
        const reportObj = this.timeline.itemsData.get(reportName);
        const { reportInfo } = reportObj;
        configToSave.push(reportObj);
        const reportMapped = mapBlueConfigTerms(reportInfo);
        const repName = simTimelineLib.joinName(
          reportMapped.Target,
          'report',
          index,
        );

        config.Report[repName] = this.createReportToBC(reportMapped, reportOnObj);
      });
      db.setSavedConfig(saveParamNames.REPORT, configToSave);
      return config;
    },

    createReportToBC(reportMapped, reportOnObj) {
      const report = Object.assign({}, reportMapped);
      const reportObjMatched = find(reportOnObj, r => r.displayName === reportMapped.ReportOn);
      // change target if soma + dendrites apply AllCompartments target
      if (reportMapped.Type === this.allCompartmentTargetObj.type) {
        report.Target = this.allCompartmentTargetObj.target;
      }
      report.Unit = reportObjMatched.unit;
      report.ReportOn = reportObjMatched.name;
      report.Type = reportObjMatched.type;
      return report;
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
      const targetSame = await simTimelineLib.isCurrentSameAsSavedTarget();
      const savedConfig = await db.getSavedConfig(saveParamNames.REPORT);
      if (!savedConfig || !targetSame) {
        return [this.createItem(this.createNewReport())];
      }
      return savedConfig;
    },

    targetSelected(target) {
      const id = simTimelineLib.getMaxId(this.timeline.itemsData) || 0;
      const newStim = this.createItem(this.createNewReport(target.displayName), id);
      this.timeline.itemsData.add(newStim);
    },
  },
  beforeDestroy() {
    eventBus.$off('create-report-config', this.creationConfigHandlerBinded);
    eventBus.$off('simulation-duration-changed', this.simulationDurationChangedBinded);
  },
};
</script>
