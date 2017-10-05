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
            // given a target returns an group object
            let i = 0;
            for (i; i<this.groups.length; i++) {
                let group = this.groups[i];
                if (group.id === target) {
                    return group;
                }
            }
            // workaround to avoid changing the user.target
            let displayName = (target === 'Mosaic' ? 'FullCA1' : target);
            let newGroup = {'id': target, 'content': displayName};
            this.groups.push(newGroup); // add element
            return newGroup;
        },
        'cleanGroups': function() {
            // check if there are no items in the group so it can remove the group
            let tempGroups = this.groups.slice(0);
            this.groups.forEach((group) => {
                let elementsInGroup = [];
                this.items.forEach((item) => {
                    /*  sync stimulus/report and item times. if not sync
                        when delete an item all the items go back to 0 - 100 duration */
                    this.syncObjectInfoWithItemTime(item);
                    if (item.group === group.id) {
                        elementsInGroup.push(item);
                    }
                });
                if (elementsInGroup.length <= 0) {
                    console.log(`group ${group.id} is empty`);
                    tempGroups = this.removeFrom(tempGroups, group);
                }
            });
            this.groups = tempGroups;
            this.timeline.setGroups(new vis.DataSet(this.groups));
            return this.groups;
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
            this.itemAdd.call(this, item, callback);
        },
        'onMove': function(item, callback) {
            // sync in the respectives stimulation/report components
            this.updateTimes(item);
            this.checkMove(item, callback);
        },
        'onRemove': function(item, callback) {
            let that = this;
            this.prettyConfirm(
                'Remove item',
                'Do you really want to remove item ' + item.content + '?',
                function(ok) {
                    if (ok) {
                        that.items = that.removeFrom(that.items, item);
                        that.groups = that.cleanGroups(item.group);
                        // sync the timeline
                        that.timeline.setData({
                            'groups': new vis.DataSet(that.groups),
                            'items': new vis.DataSet(that.items),
                        });
                    }
                }
            );
        },
        'updateOrAdd': function(originalArray, newItem) {
        // this will update the object or add a new one
            for (let i = 0; i < originalArray.length; i++) {
                if (originalArray[i].id === newItem.id) {
                    originalArray[i] = newItem;
                    return originalArray;
                }
            }
            originalArray.push(newItem);
            return originalArray;
        },
        // it comes from the onUpdate and the form calls this function
        'editItem': function(editedItem) {
            // change the  items
            this.items = this.updateOrAdd(this.items, editedItem.item);
            let newGroupInfo = this.setupGroups(editedItem.item.group);
            // change groups
            if (!editedItem.callback) {
                // updates the timeline
                this.timeline.itemsData.getDataSet().update(editedItem.item);
                this.timeline.groupsData.getDataSet().update(newGroupInfo);
                // this.timeline.groupsData.update(newGroupInfo);
            } else {
                editedItem.callback(editedItem.item);
            }
            this.cleanGroups();
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
        'itemAdd': function(item, callback) {
            let oldItem = item || null;
            this.createNewItem(oldItem, callback);
        },
        'itemDelete': function() {
            let deleteId = this.timeline.getSelection()[0];
            if (deleteId === undefined) {
                console.error('Please select an item in the timeline');
                this.prettyAlert('Unable to delete', 'No item was selected');
                return;
            } else {
                let item = this.timeline.itemsData.get(deleteId);
                this.onRemove.call(this, item);
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
        'removeFrom': function(originalArray, deletedItem) {
            originalArray = originalArray.filter(function(item) {
                return item.id !== deletedItem.id;
            });
            return originalArray;
        },
    },
};
