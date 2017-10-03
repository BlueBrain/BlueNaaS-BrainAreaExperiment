import vis from 'vis/dist/vis.min.js';

export default {
    'data'() {
        return {
            'header': {},
        };
    },
    'methods': {
        'toggleModal': function(value) {
            this.showModal = value;
        },
        'setupGroups': function(target) {
            let i = 0;
            for (i; i<this.groups.length; i++) {
                let group = this.groups[i];
                if (group.id === target) {
                    return;
                }
            }
            // workaround to avoid changing the user.target
            let displayName = target === 'Mosaic' ? 'FullCA1' : target;
            let newGroup = {'id': target, 'content': displayName, 'value': i};
            this.groups.push(newGroup); // add element
            return newGroup;
        },
        'prettyAlert': function(title, text) {
            swal({
                'title': title,
                'text': text,
                'type': 'info',
                'confirmButtonColor': '#879fcb',
            });
        },
        'prettyConfirm': function(title, text, callback) {
            swal({
                'title': title,
                'text': text,
                'type': 'warning',
                'showCancelButton': true,
                'confirmButtonColor': '#ac6067',
                'cancelButtonColor': '#879fcb',
                'confirmButtonText': 'Delete',
                'focusCancel': true,
            }).then(callback);
        },
        'onAdd': function(item, callback) {
            this.itemAdd.call(this, item);
        },
        'onMove': function(item, callback) {
            this.updateTimes(item);
            callback(item);
        },
        'onRemove': function(item, callback) {
            let that = this;
            this.prettyConfirm(
                'Remove item',
                'Do you really want to remove item ' + item.content + '?',
                function(ok) {
                    if (ok) {
                        if (callback) {
                            callback(item); // confirm deletion
                        } else {
                            that.timeline.itemsData.remove(item.id);
                        }
                    }
                }
            );
        },
        'updateOrAdd': function(originalArray, newItem) {
        // this will update the object or add a new one
            for (let i = 0; i < originalArray.length; i++) {
                if (originalArray[i].id === newItem.id) {
                    originalArray[i] = newItem;
                    return;
                }
            }
            originalArray.push(newItem);
            return;
        },
        // it comes from the onUpdate and the form calls this function
        'editItem': function(editedItem) {
            // this.changeContentAndGroup(editedItem);
            // this.updateOrAdd(this.items, editedItem.item);
            // this.timeline.itemsData.clear();
            // this.timeline.setGroups(new vis.DataSet(this.groups));
            // this.timeline.setItems(new vis.DataSet(this.items));
            // this.toggleModal(false);

            // TODO modify only the item but so far I got error calling the callback
            this.changeContentAndGroup(editedItem);
            this.updateOrAdd(this.items, editedItem.item);
            if (!editedItem.callback) {
                this.timeline.itemsData.update(editedItem.item);
            } else {
                editedItem.callback(editedItem.item);
            }
            this.toggleModal(false);
        },
        'changeConnectionName': function(target, pattern, newId) {
            let temp = [];
            temp.push(target);
            temp.push(pattern);
            temp.push(newId);
            let oldName = temp[0];
            if (oldName !== pattern) {
                temp[0] = target;
            }
            oldName = temp[temp.length - 1];
            if (oldName !== newId) {
                temp[temp.length - 1] = newId;
            }

            return temp.join('_');
        },
        'itemAdd': function(item) {
            let copyFromId = this.timeline.getSelection()[0];
            let oldItem = null;
            if (copyFromId == undefined) {
                // no element is selected. Grab the first one
                copyFromId = this.timeline.getVisibleItems()[0];
            }
            if (copyFromId != undefined) {
                // item exists (either selected or visible chosen)
                oldItem = this.timeline.itemsData.get(copyFromId);
                // update the old item with the new created item
                if (item && item.start) { // creation with the mouse
                    oldItem.start = item.start.getMilliseconds();
                    oldItem.group = item.group;
                }
                if (item && item.name) { // create with the target selector
                    oldItem.group = item.name;
                    let newGroup = this.setupGroups(item.name);
                    if (newGroup) {
                        this.timeline.groupsData.getDataSet().add(newGroup);
                    }
                }
            }
            this.cloneAndCreateItem(oldItem);
            this.syncTimelineWithVariables();
        },
        'itemDelete': function() {
            let that = this;
            let deleteId = this.timeline.getSelection()[0];
            if (deleteId === undefined) {
                console.error('Please select an item in the timeline');
                this.prettyAlert('Unable to delete', 'No item was selected');
                return;
            } else {
                let item = this.timeline.itemsData.get(deleteId);
                this.onRemove.call(this, item, function() {
                    that.timeline.itemsData.remove(item.id);
                    that.syncTimelineWithVariables();
                    // function implemented in report and stimulus
                    that.removeFromConfig(item);
                });
            }
        },
        'itemEdit': function() {
            let editId = this.timeline.getSelection()[0];
            if (editId === undefined) {
                this.prettyAlert('Unable to edit', 'No item was selected');
                console.error('Please select an item in the timeline');
                return;
            } else {
                let item = this.timeline.itemsData.get(editId);
                this.onUpdate.call(this, item, undefined);
            }
            this.syncTimelineWithVariables();
        },
        'syncTimelineWithVariables': function() {
            // it requires data objects like items[], groups[], timeline{}
            let timeline = this.timeline;

            let groupsIds = timeline.groupsData.getIds();
            let groupsTemp = [];
            for (let i=0; i<groupsIds.length; i++) {
                let obj = timeline.groupsData.get(groupsIds[i]);
                groupsTemp.push(obj);
            }
            this.groups = groupsTemp;

            let itemsIds = timeline.itemsData.getIds();
            let itemsTemp = [];
            for (let i=0; i<itemsIds.length; i++) {
                let obj = timeline.itemsData.get(itemsIds[i]);
                itemsTemp.push(obj);
            }
            this.items = itemsTemp;
        },
        'getItemId': function() {
            let ids = this.timeline.itemsData.getIds();
            let max = Math.max(...ids) + 1;
            if (max < 0) {
                max = 0;
            }
            return max;
        },
        'createTimeline': function() {
            let container = this.$el.querySelector('#visualization');
            let that = this;
            let options = {
                'selectable': true,
                'timeAxis': {'scale': 'millisecond', 'step': 10},
                'showMajorLabels': false,
                'showCurrentTime': false,
                'format': {
                    'minorLabels': function(date, scale, step) {
                        if (scale === 'millisecond') {
                            return new Date(date).getTime() + 'ms';
                        }
                    },
                },
                'start': 0,
                'end': this.endTime * 1.5,
                'editable': true,
                'onAdd': this.onAdd,
                'onMove': this.onMove,
                'onUpdate': this.onUpdate,
                'onRemove': this.onRemove,
            };

            this.timeline = new vis.Timeline(container);
            this.timeline.setOptions(options);
            this.timeline.setGroups(new vis.DataSet(this.groups));
            this.timeline.setItems(new vis.DataSet(this.items));
            this.timeline.addCustomTime(this.endTime, 'end');
            this.timeline.setCustomTimeTitle('End of the simulation', 'end');

            // tooltip section
            this.tooltipElem = this.$el.querySelector('.tooltip-span');
            this.timeline.on('itemover', this.createTooltip);
            this.timeline.on('itemout', function() {
                that.tooltipElem.style.display = 'none';
            });
            this.timeline.on('timechange', this.createCustomTimeLabel);
            this.timeline.on('rangechange', this.createCustomTimeLabel);

            setTimeout(this.createCustomTimeLabel, 100); // waits until timeline draws
            this.changeCustomTimeLabelOnResize();
        },
        'showTooltip': function(event, output) {
            // comes from the timeline.on('itemover')
            let x = event.event.clientX;
            let y = event.event.clientY;
            this.tooltipElem.style.top = (y + 20) + 'px';
            this.tooltipElem.style.left = (x + 20) + 'px';
            this.tooltipElem.style.display = 'block';
            this.tooltipElem.innerText = output;
        },
        'createCustomTimeLabel': function(properties) {
            // this redraw the label for indicate the end of simulation
            let customTime = this.$el.querySelector('.vis-custom-time');
            let customLabel = this.$el.querySelector('.custom-time-label');
            if (customTime && customLabel) {
                let left = parseFloat(customTime.style.left);
                customLabel.style.left = (left + 71) + 'px';
            }
        },
        'changeCustomTimeLabelOnResize': function() {
            let timeout = false; // holder for timeout id
            let delay = 250; // delay after event is "complete" to run callback
            let that = this;
            window.addEventListener('resize', function() {
                clearTimeout(timeout);
                // start timing for event "completion"
                timeout = setTimeout(that.createCustomTimeLabel, delay);
            });
        },
    },
};
