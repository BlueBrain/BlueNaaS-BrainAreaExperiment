
<template>
  <div class="gids-selector">
    <i-form
      ref="formValidate"
      name="reportForm"
      class="negative-top-padding"
      :rules="ruleValidate"
      :model="{}"
    >
      <form-item prop="gids" label="">
        <i-input
          v-model="gids"
          placeholder="e.g. 1-5,8,50"
          class="full-width"
        />
      </form-item>
    </i-form>
  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';

const checkRanges = (prunedSpaces) => {
  const rangesArray = [...prunedSpaces.matchAll(/([0-9]+)-([0-9]+)/g)];
  return rangesArray.reduce((acc, range) => (
    acc && (parseInt(range[2], 10) > parseInt(range[1], 10))
  ), true);
};

const inputValidator = (inputText) => {
  // perform checks on numbers and ranges
  const prunedSpaces = inputText.replace(/ /g, '');
  const searchWrongFormatRe = /^$|,{2,}|-{2,}|[0-9]+-[0-9]+(?=-)|^[^0-9]|[a-zA-Z]|,-|-,|[,-]$/;
  const hasCorrectFormat = !searchWrongFormatRe.test(prunedSpaces);
  const isRangeCorrect = prunedSpaces.includes('-') ? checkRanges(prunedSpaces) : true;
  return hasCorrectFormat && isRangeCorrect;
};

export default {
  name: 'gids-selector',
  props: ['analysisObj'],
  data() {
    return {
      gids: '',
      ruleValidate: {
        gids: [{ validator: this.validateGids }],
      },
      inputValidator,
    };
  },
  components: {
    AutocompleteTargets,
  },
  mounted() {
    this.$refs.formValidate.validate();
  },
  methods: {
    changePopulation(newPopulation) {
      this.targetSelected = newPopulation;
      this.closeModal();
    },
    validateGids(rule, value, callback) {
      const isValid = this.inputValidator(this.gids);
      if (!isValid) { callback('format not correct'); }
      callback();
      this.$store.commit('updateAnalysisValue', { analysisObj: this.analysisObj, value: this.gids });
    },
  },
};
</script>


<style lang="scss">
  .gids-selector {
    /* the form adds some padding, remove it and make it one line */
    .negative-top-padding {
      .ivu-form-item-label {
        padding-top: 5px;
        padding-bottom: 4px;
      }
      .ivu-form-item-content {
        line-height: 0px;
      }
      .ivu-form-item {
        margin-bottom: 0px;
      }
    }
  }
</style>
