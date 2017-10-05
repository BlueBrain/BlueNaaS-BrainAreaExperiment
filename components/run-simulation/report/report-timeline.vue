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
            report.ReportOn = 'v';
            report.Unit = 'mV';
            report.Target = 'FullCA1';
            report.Type = 'Compartment';
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
                let report = this.items[i].reportInfo;
                // workarounds for the GUI to match the user.target and BlueConfig
                if (report.Target === 'FullCA1') {
                    report.Target = 'Mosaic';
                }
                let repName = this.changeConnectionName(report.Target, 'report', i);
                config['Report'][repName] = report;
            }
            return config;
        },
    },
    'mounted': function() {
        // create a dataset with items
        let reportInfo = this.createNewReport();
        let item = this.createItem( // id, group, content, start, end, connection
            0,
            reportInfo.Target,
            reportInfo.ReportOn,
            reportInfo.StartTime,
            reportInfo.EndTime, // TODO: change this to duration
            reportInfo
        );

        this.setupGroups(reportInfo.Target);
        this.items.push(item);
        this.createTimeline(); // from the simulationTimeline.js

        this.$parent.$on('reportTargetSelected', (target) => {
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
