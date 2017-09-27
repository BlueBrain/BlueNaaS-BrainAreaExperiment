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
        <span class="custom-time-label">End</span> <!-- custom time label -->
    </div>
</template>

<script>
// import blueConfig from 'assets/entity.json';
import modal from 'components/shared/modal-component.vue';
import ReportForm from 'components/run-simulation/report/report-form.vue';
import EditButtons from 'components/run-simulation/edit-buttons.vue';
import mixin from 'mixins/simulationTimeline.js';
export default {
    'name': 'report-timeline',
    'props': ['endTime', 'forwardSkip', 'blueConfig'],
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
            let a = {};
            let reportObj = this.config.Report[item.connection];
            if (reportObj) {
                a.item = item;
                a.report = reportObj;
                a.callback = callback;
                this.reportEditableObject = a;
                this.showModal = true;
            }
        },
        'updateTimes': function(item) {
            // this will change the item and config with the delay and duration in (ms)
            let connectionObj = this.config.Report[item.connection];
            let start = item.start.getTime();
            let end = item.end.getTime();
            if (connectionObj) {
                item.start = connectionObj.StartTime = start;
                item.end = connectionObj.EndTime = end;
            }
            this.updateOrAdd(this.items, item);
            this.changeContentAndGroup({'item': item});
        },
        'createNewItem': function(id, group, content, start, end, connection) {
            return {
                'id': id,
                'group': group,
                'content': content,
                'start': start,
                'end': end,
                'connection': connection,
                'className': content,
            };
        },
        'changeContentAndGroup': function(editedItem) {
            let oldConnection = editedItem.item.connection;
            let newTarget = editedItem.item.group;
            let newConnection = this.changeConnectionName(
                newTarget,
                'report',
                editedItem.item.id
            );

            let newReportObj = Object.assign({}, this.config.Report[oldConnection]);

            if (newConnection !== oldConnection) {
                this.config.Report[newConnection] = newReportObj;
                let newGroup = this.setupGroups(newTarget);
                if (newGroup) {
                    this.timeline.groupsData.getDataSet().add(newGroup);
                }
                delete this.config.Report[oldConnection];
                editedItem.item.connection = newConnection;
            }
            // upload the label and the target in the config
            this.config.Report[newConnection].Target = editedItem.item.group;
            this.config.Report[newConnection].ReportOn = editedItem.item.content;
        },
        'cloneAndCreateItem': function(newItem) {
            let reportObj = undefined;
            if (!newItem) { // there is no more items to copy the configuration
                newItem = {};
                reportObj = Object.assign({}, this.createNewReport());
                newItem.connection = 'L4_PC_report_0';
                newItem.group = 'L4_PC';
            } else {
                reportObj = Object.assign({}, this.config.Report[newItem.connection]);
                reportObj.StartTime = newItem.start;
                reportObj.EndTime = newItem.end;
            }
            if (newItem.start > newItem.end) {
                newItem.end = newItem.start + 10;
                reportObj.EndTime = newItem.end;
            }
            let id = this.getItemId();
            let newObj = this.createNewItem(
                id,
                newItem.group,
                reportObj.ReportOn,
                reportObj.StartTime,
                reportObj.EndTime,
                // this will transform for example "Linear_stimulus_0" to "Noise_stimulus_1"
                this.changeConnectionName(newItem.group, 'report', id)
            );
            reportObj.Target = newItem.group;

            this.config.Report[newObj.connection] = reportObj;

            let a = {};
            a.item = newObj;
            a.report = reportObj;
            this.reportEditableObject = a;
            this.showModal = true;
        },
        'removeFromConfig': function(item) {
            delete this.config.Report[item.connection];
        },
        'createNewReport': function() {
            let report = {};
            report.StartTime = 0;
            report.EndTime = this.endTime;
            report.ReportOn = 'v';
            report.Unit = 'mV';
            report.Target = '';
            report.Type = 'Compartment';
            report.Format = 'Bin';
            report.Dt = 0.1;
            return report;
        },
        'createTooltip': function(event) {
            // comes from the timeline.on('itemover')
            let item = this.timeline.itemsData.get(event.item);
            let reportInfo = this.config.Report[item.connection];
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
    },
    'mounted': function() {
        // create a dataset with items
        let reports = Object.keys(this.config.Report);
        for (let i=0; i<reports.length; i++) {
            let connection = reports[i];
            let reportConnectionObj = this.config.Report[connection];
            let target = reportConnectionObj.Target;
            this.setupGroups(target);

            let item = this.createNewItem( // id, group, content, start, end, connection
                i,
                target,
                reportConnectionObj.ReportOn,
                reportConnectionObj.StartTime,
                reportConnectionObj.EndTime, // TODO: change this to duration
                connection
            );

            this.items.push(item);
        }
        this.createTimeline(); // from the simulationTimeline.js
        this.$parent.$on('reportTargetSelected', (target) => {
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
    .duration-skip {
        float: right;
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
    .report-timeline .vis-item.vis-line.vis-editable {
        display: none;
    }
    .report-timeline .vis-item.vis-dot.vis-editable {
        display: none;
    }
    .report-timeline .vis-item.NPoisson {
        background-color: #F6EED5;
        border-color: #F7Df97;
    }
    .report-timeline .vis-item.v {
        background-color: #F6D5ED;
        border-color: #F797E0;
    }
    .report-timeline .vis-item.Noise {
        background-color: #d5ddf6;
        border-color: #97B0F8;
    }
    .report-timeline .vis-item.vis-selected {
        -webkit-transition: background-color 0.25s linear;
        border-color: #FFC200;
        background-color: #FFF785;
        z-index: 2;
    }
    .report-timeline .vis-custom-time.end {
        background-color: #FF7F6E;
        width: 2px;
        pointer-events: none;
    }
    .report-timeline .tooltip-span {
        z-index: 2;
        background-color: #8393b7;
        color: white;
        border-radius: 7px;
        font-size: 14px;
        padding: 8px;
        display: none;
        position: fixed;
    }
    .report-timeline .vis-label {
        width: 100px;
    }
    .report-timeline .vis-panel {
        box-sizing: content-box;
    }

</style>
