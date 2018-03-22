<template>
    <div class="report-timeline">
        <span class="targets-label" title="Targets of the stimulus">Targets</span>
        <edit-buttons class="edit-buttons"
            @itemAdd="itemAdd"
            @itemDelete="itemDelete"
            @itemEdit="itemEdit"></edit-buttons>
        <div id="visualization" class="visualization"></div>

        <modal :show="showModal" @changeModalVisibility="toggleModal">
            <h3 slot="header">Report Definition</h3>
            <div slot="content">
                <report-form :reportEditableObject="reportEditableObject" @changeModalVisibility="toggleModal"
                @editItem="editItem"></report-form>
            </div>
        </modal>
        <span class="tooltip-span"></span> <!-- tooltip hover item -->
    </div>
</template>

<script>
import modal from 'components/shared/modal-component.vue';
import ReportForm from 'components/run-simulation/report/report-form.vue';
import EditButtons from 'components/run-simulation/edit-buttons.vue';
import mixin from 'mixins/simulationTimeline.js';
import utils from 'assets/utils.js';
export default {
  'name': 'report-timeline',
  'props': ['endTime', 'forwardSkip', 'blueConfig', 'defaultTarget'],
  'mixins': [mixin],
  'data': function() {
    return {
      'timeline': undefined,
      'config': this.blueConfig,
      'groups': [],
      'items': [],
      'showModal': false,
      'reportEditableObject': {},
      'latestItem': undefined,
      'tooltipElem': undefined,
    };
  },
  'components': {
    'modal': modal,
    'report-form': ReportForm,
    'edit-buttons': EditButtons,
  },
  'methods': {
    'onUpdate': function(item, callback) {
      this.reportEditableObject = {'item': item, 'callback': callback};
      this.showModal = true;
    },
    'updateTimes': function(item) {
      // this will sync the item that was edited with the report inside this item
      try {
        item.start = item.start.getTime();
        item.end = item.end.getTime();
      } catch (e) {};
      item.reportInfo.StartTime = item.start;
      item.reportInfo.EndTime = item.end;
    },
    'syncObjectInfoWithItemTime': function(item) {
      /* put the information from the information stimulus in the item to conserve the position */
      try {
        item.start = item.reportInfo.StartTime;
        item.end = item.reportInfo.EndTime;
      } catch (e) {
        console.error('Unable to put the report time in item');
      };
    },
    'checkMove': function(item, callback) {
      // check if the item was changed from group. If so open the edit page
      if (item.group !== item.reportInfo.Target) {
        item.reportInfo.Target = item.group;
        this.editItem({'item': item, 'callback': callback});
      } else {
        callback(item);
      }
    },
    'createItem': function(id, group, content, start, end, reportInfo) {
      return {
        'id': id,
        'group': group,
        'content': content,
        'start': start,
        'end': end,
        'className': content,
        'reportInfo': reportInfo,
      };
    },
    'createNewItem': function(newItem) {
      let reportObj = Object.assign({}, this.createNewReport());
      if (newItem) {
        reportObj.Target = newItem.group;
        if (newItem.start) {
          reportObj.StartTime = newItem.start.getTime();
        }
      }

      if (newItem && newItem.start > newItem.end) {
        newItem.end = newItem.start + 10;
        reportObj.StartTime = newItem.start;
        reportObj.EndTime = newItem.end;
      }
      let id = this.getItemId();
      let newObj = this.createItem(
        id,
        reportObj.Target,
        reportObj.ReportOn,
        reportObj.StartTime,
        reportObj.EndTime,
        reportObj
      );

      this.reportEditableObject = {'item': newObj};
      this.showModal = true;
    },
    'removeFromConfig': function(item) {
      delete this.config.Report[item.connection];
    },
    'createNewReport': function() {
      let report = {};
      report.StartTime = 0;
      report.EndTime = parseInt(this.endTime);
      report.ReportOn = 'voltage';
      report.Unit = 'mV';
      report.Target = this.defaultTarget;
      report.Type = 'Soma';
      report.Format = 'Bin';
      report.Dt = 0.1;
      return report;
    },
    'createTooltip': function(event) {
      // comes from the timeline.on('itemover')
      let item = this.timeline.itemsData.get(event.item);
      let reportInfo = item.reportInfo;
      let output = [];
      output.push(`Dt: ${reportInfo.Dt}`);
      output.push(`Type: ${reportInfo.Type}`);
      if (reportInfo.Scaling) {
        output.push(`Scaling: ${reportInfo.Scaling}`);
      }
      if (output.length > 0) {
        this.showTooltip(event, output.join('\n'));
      }
    },
    'createConfig': function(config) {
      // clean the default configuration
      config['Report'] = {};
      for (let i=0; i<this.items.length; i++) {
        // workarounds for the GUI to match the user.target and BlueConfig
        let reportMapped = utils.mapAll(this.items[i].reportInfo);
        let repName = this.changeConnectionName(reportMapped.Target, 'report', i);
        config['Report'][repName] = reportMapped;
      }
      return config;
    },
    'setNewItem': function(newItem, id = 0) {
      let item = this.createItem( // id, group, content, start, end, connection
        id,
        newItem.Target,
        newItem.ReportOn,
        newItem.StartTime,
        newItem.EndTime, // TODO: change this to duration
        newItem
      );

      this.setupGroups(newItem.Target);
      this.items.push(item);
    },
    'loadPrevConfig': function() {
      let itemsInBlueConfig = Object.keys(this.config.Report);
      if (itemsInBlueConfig.length < 1) {
        // no previous BlueConfig
        let reportInfo = this.createNewReport();
        this.setNewItem(reportInfo);
        return;
      }
      itemsInBlueConfig.forEach((report, index) => {
        let item = this.config.Report[report];
        let a = utils.unMapAll(item);
        this.setNewItem(a, index);
      });
    },
  },
  'mounted': function() {
    this.loadPrevConfig(); // if there is prev load otherwise, create
    this.createTimeline(); // from the simulationTimeline.js
    this.$parent.$on('reportTargetSelected', (target) => {
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
