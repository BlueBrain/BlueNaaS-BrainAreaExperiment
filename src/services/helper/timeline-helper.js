
import noop from 'lodash/noop';
import flatMap from 'lodash/flatMap';
import { Timeline, DataSet } from 'timeline-plus';
import store from '@/services/store';
import db from '@/services/db';
import { saveParamNames } from '@/common/constants';


function joinName(target, type, newId) {
  const temp = [];
  temp.push(target);
  temp.push(type);
  temp.push(newId);

  return temp.join('_');
}

/* ---- Functions that are shared stimulus - reports ---- */
function editItem(context) {
  const modifiedContext = context;
  modifiedContext.showModal = false;
  const modifiedItem = modifiedContext.editableItem.item;
  if (modifiedContext.editableItem.callback) {
    modifiedContext.editableItem.callback(modifiedItem);
  } else {
    // add or update manually (comes from buttons)
    const { id } = modifiedItem;
    const savedItem = modifiedContext.timeline.itemsData.get(id);
    if (!savedItem) {
      modifiedContext.timeline.itemsData.add(modifiedItem);
    } else {
      modifiedContext.timeline.itemsData.update(modifiedItem);
    }
  }
}

function deleteItem(item, context) {
  let currentItem = item;
  if (!currentItem) {
    const editId = context.timeline.getSelection()[0];
    if (editId === undefined) {
      context.$Message.error('Please select an item to remove');
      return;
    }
    currentItem = context.timeline.itemsData.get(editId);
  }
  context.timeline.itemsData.remove(currentItem);
}

function updatedItem(item, callback, context) {
  let currentItem = item;
  const currentContext = context;
  if (!currentItem) {
    const editId = currentContext.timeline.getSelection()[0];
    if (editId === undefined) {
      currentContext.$Message.error('Please select an item to edit');
      return;
    }
    currentItem = currentContext.timeline.itemsData.get(editId);
  }

  currentContext.editableItem = { item: currentItem, callback };
  currentContext.showModal = true;
}
/* ---- Functions that are shared stimulus - reports ---- */

function getItemId(itemsData) {
  const ids = itemsData.getIds();
  let max = Math.max(...ids) + 1;
  if (max < 0) max = 0;
  return max;
}

function createCustomTimeLabel() {
  // this redraw the label for indicate the end of simulation
  const customTime = document.querySelector('.vis-custom-time');
  const customLabel = document.querySelector('.custom-time-label');
  if (customTime && customLabel) {
    const left = parseFloat(customTime.style.left);
    customLabel.style.left = `${left + 71} px`;
  }
}

function createTimeline(container, eventsObj) {
  const { defaultDuration } = store.state.fullConfig.generalSimParams;
  const options = {
    selectable: true,
    timeAxis: { scale: 'millisecond', step: 50 },
    showMajorLabels: false,
    showCurrentTime: false,
    format: {
      minorLabels(date) {
        return `${new Date(date).getTime()} ms`;
      },
    },
    start: 0,
    end: defaultDuration * 1.5,
    minHeight: 90,
    editable: true,
    onAdd: eventsObj.onAdd || noop,
    onMove: eventsObj.onMove || noop,
    onUpdate: eventsObj.onUpdate || noop,
    onRemove: eventsObj.onRemove || noop,
    zoomMax: 1000 * 3, // 5s limit zoom out
  };

  const timeline = new Timeline(container);
  timeline.setOptions(options);
  timeline.addCustomTime(defaultDuration, 'end');
  return timeline;
}

function showTooltip(event, output, tooltipElem) {
  // comes from the timeline.on('itemover')
  const x = event.event.clientX;
  const y = event.event.clientY;
  /* eslint-disable no-param-reassign */
  tooltipElem.style.top = `${y + 20}px`;
  tooltipElem.style.left = `${x + 20}px`;
  tooltipElem.style.display = 'block';
  tooltipElem.innerText = output;
  setTimeout(() => {
    tooltipElem.style.display = 'none';
  }, 5000);
  /* eslint-enable no-param-reassign */
}

function getMaxId(dataSet) {
  const ids = flatMap(dataSet._data, item => item.id);
  if (!ids.length) return 0;
  const maxId = Math.max(...ids);
  return maxId + 1;
}

async function isCurrentSameAsSavedTarget() {
  const savedSimConfig = await db.getSavedConfig(saveParamNames.SIM_PARAMS);
  if (!savedSimConfig) return false;
  return store.state.simulationPopulation === savedSimConfig.circuitTarget;
}

export default {
  editItem,
  deleteItem,
  updatedItem,
  showTooltip,
  createTimeline,
  createCustomTimeLabel,
  getItemId,
  getMaxId,
  DataSet,
  joinName,
  isCurrentSameAsSavedTarget,
};
