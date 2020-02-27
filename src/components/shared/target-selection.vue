
<template>
  <div class="target-selection-container">
    <!-- <div class="title">Add targets using slices of the Hippocampus</div> -->
    <div class="target-selection">
      <section class="img-container">
        <img id="currentSliceImg">
      </section>
      <section class="labels-container">
        <p
          v-for="(item, index) in imagePoll"
          :key="index"
          class="list-item"
          @mouseenter="hoverSelector(item)"
          @click="targetSelected(item)"
        >
          <span>{{ item['displayName'] }}</span>
        </p>

      </section>
    </div>
  </div>
</template>


<script>
import isEqual from 'lodash/isEqual';
import axios from 'axios';

export default {
  name: 'TargetSelection',
  props: ['itemsAvailable'],
  data() {
    return {
      selectedSliceObj: {},
      cachedImgs: {},
    };
  },
  computed: {
    imagePoll() {
      if (this.itemsAvailable) {
        return this.itemsAvailable.filter(elem => elem.src);
      }
      const allTargets = this.$store.state.fullConfig.circuitConfig.targets;
      return allTargets.filter(elem => elem.src);
    },
  },
  mounted() {
    if (this.imagePoll && this.imagePoll.length) {
      const indexImgDefaultModel = this.imagePoll.findIndex(target => (
        target.displayName === this.$store.state.fullConfig.circuitConfig.defaultPopulation
      ));
      this.firstImgElement = this.imagePoll[indexImgDefaultModel];
      if (this.firstImgElement) { this.loadImage(); }
    }
  },
  methods: {
    hoverSelector(targetObj) {
      if (isEqual(targetObj, this.selectedSliceObj)) return;
      this.loadImage(targetObj);
    },
    async loadImage(targetObj) {
      const newElem = targetObj || this.firstImgElement;
      const image = this.$el.querySelector('#currentSliceImg');
      image.classList.add('blur');
      this.selectedSliceObj = newElem;

      let imgBlob = null;
      if (this.cachedImgs[newElem.displayName]) {
        imgBlob = this.cachedImgs[newElem.displayName];
      } else {
        const response = await axios({ url: newElem.src, responseType: 'blob' });
        imgBlob = response.data;
        this.cachedImgs[newElem.displayName] = imgBlob;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        image.src = reader.result;
        image.classList.remove('blur');
      };
      reader.onerror = () => { this.$Message.error('Error loading target image'); };
      reader.readAsDataURL(imgBlob);
    },
    getNext(element) {
      const indexFound = this.imagePoll.findIndex(pollElements => (
        element.src === pollElements.src
      ));
      const nextIndex = indexFound + 1;
      if (this.imagePoll.length > nextIndex) {
        return this.imagePoll[nextIndex];
      }
      return this.firstImgElement;
    },
    targetSelected() {
      this.$emit('target-selected', this.selectedSliceObj);
    },
  },
};
</script>


<style scoped>
    .title {
        font-size: 10px;
        text-align: center;
        margin-left: 15px;
    }
    .target-selection {
        display: flex;
        flex-direction: row;
    }
    .img-container {
        width: 130px;
        display: flex;
        align-items: center;
    }
    img {
        position: absolute;
        width: 130px;
        transition: opacity 0.2s;
    }
    .blur {
        opacity: 0.5;
    }
    .labels-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 130px;
        overflow-y: scroll;
        overflow-x: hidden;
        max-width: 140px;
    }
    .list-item {
        padding: 2px;
        margin: 0;
    }
    .list-item:hover {
        background-color: #e5e6ef;
        border-radius: 5px;
        cursor: pointer;
    }
    .plus-icon.hidden {
        opacity: 0;
    }
    .list-item:hover .plus-icon.hidden {
        opacity: 1;
    }
</style>
