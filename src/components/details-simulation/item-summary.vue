
<template>
  <div class="item-summary">

    <div v-if="!detailsLoading">
      <div class="top">
        <span class="type">{{ itemDetails.type }}:</span>
        <span class="name">{{ itemDetails.name || "Not available yet" }}</span>
      </div>

      <div class="bottom">
        <span class="section">
          <icon type="ios-finger-print" />
          <span>{{ itemDetails.id }}</span>
        </span>

        <span class="section">
          <icon :type="getStatusIcon(itemDetails.status)" />
          <span>{{ itemDetails.status }}</span>
        </span>

        <span class="section">
          <icon type="ios-time" />
          <span>{{ submissionTime }}</span>
        </span>

        <span>
          <slot/>
        </span>
      </div>
    </div>

    <icon v-else type="md-sync" size="20" class="spin" />

  </div>
</template>


<script>
import { getStatusIcon } from '@/assets/job-status';

export default {
  name: 'ItemSummary',
  props: ['itemDetails'],
  data() {
    return {
      getStatusIcon,
    };
  },
  computed: {
    detailsLoading() {
      return Object.keys(this.itemDetails).length === 0;
    },
    submissionTime() {
      const date = new Date(this.itemDetails.submissionTime);
      return date.toLocaleString();
    },
  },
};
</script>


<style scoped>
  .item-summary {
    min-height: 40px;
  }
  .type {
    margin-right: 5px;
  }
  .name {
    font-weight: bold;
  }
  .section {
    margin-right: 10px;
    display: inline-flex;
    align-items: center;
  }
  .section span {
    margin-left: 2px;
  }
  .bottom {
    display: inline-flex;
  }
</style>
