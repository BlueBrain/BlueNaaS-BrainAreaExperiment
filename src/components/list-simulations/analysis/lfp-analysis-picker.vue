
<template>
  <div class="lfp-analysis-picker">

    <form-item prop="lfpTarget" label="Population:">
      <i-select v-model="lfpTarget" class="custom-small-input">
        <i-option
          v-for="targetElem in lfpTargets"
          :key="targetElem"
          :value="targetElem"
        >{{ targetElem }}</i-option>
      </i-select>
    </form-item>

    <form-item label="Plots:">
      <checkbox-group v-model="lfpAnalysisChosen">
        <checkbox label="spectrum">Spectrum</checkbox>
        <checkbox label="trace">Trace</checkbox>
      </checkbox-group>
    </form-item>

    <form-item label="Duration (ms):" class="inline-time">
      <input-number
        v-model="startTime"
        placeholder="Start"
        class="short-input"
        :min="0"
      />
      <span> - </span>
      <input-number
        v-model="endTime"
        placeholder="End"
        class="short-input"
        :min="1"
      />
    </form-item>

    <divider>Specify Point(s)</divider>
    <div class="centered">
      <row type="flex" justify="space-between">
        <i-col span="2"></i-col>
        <i-col span="16">Points:</i-col>
        <i-col span="3">
          <i-button
            type="success"
            icon="md-add"
            @click="addNewPoint()"
          />
        </i-col>
      </row>

      <div class="scollable-points">
        <transition-group name="list">
          <row
            v-for="(pointObj, index) in pointsCollection"
            :key="pointObj.index"
            type="flex"
            justify="space-between"
            class="spaced-row"
          >
            <i-col span="2">
              <icon
                v-if="!pointObj.isValid"
                title="This point is not correct"
                type="ios-alert"
                class="not-valid"
              />
            </i-col>
            <i-col span="16">
              <i-input
                v-model="pointObj.value"
                @on-blur="checkPoint(pointObj)"
                class="short"
              />
            </i-col>
            <i-col span="3">
              <i-button
                type="primary"
                ghost
                icon="md-remove"
                @click="removePoint(index)"
              />
            </i-col>
          </row>
        </transition-group>
      </div>

      <upload
        action="/dummy-endpoint"
        :before-upload="fileUploaded"
        class="big-spaced-top"
      >
        <i-button
          icon="ios-cloud-upload-outline"
          type="primary"
          ghost
        >Upload files</i-button>
      </upload>

    </div>

  </div>
</template>


<script>
import uuidGen from 'uuid';
import { pointIsValid } from '@/common/utils';

const maxUploadFileSize = 400;

export default {
  name: 'lfp-analysis-picker',
  props: ['simDuration', 'lfpTargets', 'defaultPopulation'],
  data() {
    return {
      pointsCollection: [],
      lfpAnalysisChosen: [],
      lfpTarget: this.defaultPopulation,
      startTime: 0,
      endTime: 1,
    };
  },
  watch: {
    simDuration(newDuration) {
      this.endTime = newDuration;
    },
    defaultPopulation(newLfpTarget) {
      this.lfpTarget = newLfpTarget;
    },
    isFulfilled(isOk) {
      this.$store.commit('setLfpFulfilled', isOk);
    },
  },
  computed: {
    isFulfilled() {
      return this.pointsCollection.length
        && this.lfpAnalysisChosen.length
        && this.lfpTarget
        && (this.endTime > this.startTime);
    },
  },
  methods: {
    sanitizePoint(point) {
      return point.split(',').map(e => e.trim()).join(',');
    },
    generatePlotsConfig() {
      const isOkObj = {
        configOk: false,
        errorMessage: null,
        hasLFPAnalysis: false, // if no points nor analysis were selected do not run LFP analysis
      };

      if (!this.lfpAnalysisChosen.length && !this.pointsCollection.length) {
        isOkObj.hasLFPAnalysis = false;
        return isOkObj;
      }
      isOkObj.hasLFPAnalysis = true;
      if (!this.lfpAnalysisChosen.length) {
        isOkObj.errorMessage = 'None LFP analysis was selected';
        return isOkObj;
      }
      if (!this.pointsCollection.length) {
        isOkObj.errorMessage = 'None LFP point was defined';
        return isOkObj;
      }
      const pointsAreCorrect = this.pointsCollection.every(pointObj => pointObj.isValid);
      if (!pointsAreCorrect) {
        isOkObj.errorMessage = 'One or more points are not correct';
        return isOkObj;
      }
      if (this.startTime >= this.endTime) {
        isOkObj.errorMessage = 'Start time should be smaller than end time';
        return isOkObj;
      }
      isOkObj.configOk = true;
      isOkObj.errorMessage = null;

      return {
        plots: this.lfpAnalysisChosen,
        points: this.pointsCollection.map(pointObj => this.sanitizePoint(pointObj.value)),
        start_time: this.startTime,
        end_time: this.endTime,
        ...isOkObj,
      };
    },
    fileUploaded(file) {
      let error = null;
      if (file.type !== 'text/plain') { error = 'File format is not txt'; }
      if (file.size > maxUploadFileSize) { error = 'File to big or too many points'; }
      if (error) {
        this.$Message.info('File to big or too many points');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        this.postProcessPointsFile(content);
      };
      reader.readAsText(file);
      return false;
    },
    addNewPoint(pointStr) {
      const newPoint = {
        index: uuidGen(),
        value: pointStr || '360.0, 330.0, 630.0',
        isValid: true,
      };
      if (pointStr) {
        // to keep order of imported points
        this.pointsCollection.push(newPoint);
      } else {
        this.pointsCollection.unshift(newPoint);
      }
      return newPoint;
    },
    removePoint(index) {
      this.pointsCollection.splice(index, 1);
    },
    postProcessPointsFile(content) {
      const points = content.split('\n');
      points.forEach((point) => {
        const newPointObj = this.addNewPoint(point);
        this.checkPoint(newPointObj);
      });
    },
    checkPoint(pointObj) {
      const result = pointIsValid(pointObj.value);
      this.$set(pointObj, 'isValid', result);
    },
  },
};
</script>


<style scoped>
  .centered {
    text-align: center;
    width: 250px;
    margin: 0 auto;
  }
  .spaced-row {
    margin: 6px 0;
  }
  .spaced-row .short {
    width: 100%;
  }
  .big-spaced-top {
    margin-top: 15px;
  }
  .not-valid {
    font-size: 14px;
    color: red;
  }
  .scollable-points {
    max-height: 150px;
    overflow-y: scroll;
  }
  .lfp-analysis-picker .inline-time .short-input {
    width: 83px;
  }
  .lfp-analysis-picker .custom-small-input {
    width: 180px;
  }
</style>
