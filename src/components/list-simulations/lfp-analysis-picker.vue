
<template>
  <div>
    <form-item label="Plots:">
      <checkbox-group v-model="lfpAnalysisChosen">
        <checkbox label="spectrum">Spectrum</checkbox>
        <checkbox label="trace">Trace</checkbox>
      </checkbox-group>
    </form-item>

    <form-item label="Start Time:">
      <input-number v-model="startTime" :min="0"/>
    </form-item>

    <form-item label="End Time:">
      <input-number v-model="endTime" :min="1"/>
    </form-item>

    <divider>Specify Point(s)</divider>
    <div class="centered">
      <Row
        type="flex"
        justify="space-between"
      >
        <i-col span="3"></i-col>
        <i-col span="13">Points:</i-col>
        <i-col span="3">
          <i-button
            type="success"
            icon="md-add"
            @click="addNewPoint()"
          />
        </i-col>
      </Row>

      <div class="scollable-points">
        <transition-group name="list">
          <Row
            v-for="(pointObj, index) in pointsCollection"
            :key="pointObj.index"
            type="flex"
            justify="space-between"
            class="spaced-row"
          >
            <i-col span="3">
              <icon
                v-if="!pointObj.isValid"
                title="This point is not correct"
                type="ios-alert"
                class="not-valid"
              />
            </i-col>
            <i-col span="13">
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
          </Row>
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
  props: ['analysisList', 'hasReport'],
  data() {
    return {
      pointsFile: null,
      pointsCollection: [],
      lfpAnalysisChosen: [],
      startTime: 0,
      endTime: 1,
    };
  },
  created() {},
  methods: {
    sanitizePoint(point) {
      return point.split(',').map(e => e.trim()).join(',');
    },
    generatePlotsConfig() {
      if (!this.lfpAnalysisChosen.length) return false;
      // check all the points are correct
      if (!this.pointsCollection.length) {
        this.$Message.error('No points were selected');
        return false;
      }
      const pointsAreCorrect = this.pointsCollection.every(pointObj => pointObj.isValid);
      if (!pointsAreCorrect) {
        this.$Message.error('One or more points are not correct');
        return false;
      }

      if (this.startTime >= this.endTime) {
        this.$Message.error('Start time should be smaller than end time');
        return false;
      }

      return {
        plots: this.lfpAnalysisChosen,
        points: this.pointsCollection.map(pointObj => this.sanitizePoint(pointObj.value)),
        start_time: this.startTime,
        end_time: this.endTime,
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
        value: pointStr || '1, 1, 1',
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
    width: 230px;
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
    overflow: scroll;
  }
</style>
