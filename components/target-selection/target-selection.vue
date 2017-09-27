<template>
  <div class="target-selection">
    <section class="img-container">
        <img id="currentSliceImg">
    </section>
    <section class="autocomplete-container">
        <list-autocomplete
            :list="imagePoll"
            selector="name"
            displaySelector="displayName"
            placeholder="Slice"
            class="autocomplete"
            @hover="hoverSelector"
            @clicked="targetSelected"></list-autocomplete>
    </section>
  </div>
</template>

<script>
import ListAutocomplete from 'components/target-selection/list-autocomplete.vue';
const TEST_IMG_URL = 'https://raw.githubusercontent.com/antonelepfl/testvue/master/imgtest/';
export default {
    'name': 'target-selection',
    'data': function() {
        return {
            'imagePoll': [
                {'name': 'slice-6', 'displayName': 'Slice -6', 'src': TEST_IMG_URL + 'slice-6_A.png?raw=true'},
                {'name': 'slice-5', 'displayName': 'Slice -5', 'src': TEST_IMG_URL + 'slice-5_A.png?raw=true'},
                {'name': 'slice-4', 'displayName': 'Slice -4', 'src': TEST_IMG_URL + 'slice-4_A.png?raw=true'},
                {'name': 'slice-3', 'displayName': 'Slice -3', 'src': TEST_IMG_URL + 'slice-3_A.png?raw=true'},
                {'name': 'slice-2', 'displayName': 'Slice -2', 'src': TEST_IMG_URL + 'slice-2_A.png?raw=true'},
                {'name': 'slice-1', 'displayName': 'Slice -1', 'src': TEST_IMG_URL + 'slice-1_A.png?raw=true'},
                {'name': 'slice0', 'displayName': 'Slice 0', 'src': TEST_IMG_URL + 'slice0_A.png?raw=true'},
                {'name': 'slice1', 'displayName': 'Slice 1', 'src': TEST_IMG_URL + 'slice1_A.png?raw=true'},
                {'name': 'slice2', 'displayName': 'Slice 2', 'src': TEST_IMG_URL + 'slice2_A.png?raw=true'},
                {'name': 'slice3', 'displayName': 'Slice 3', 'src': TEST_IMG_URL + 'slice3_A.png?raw=true'},
                {'name': 'slice4', 'displayName': 'Slice 4', 'src': TEST_IMG_URL + 'slice4_A.png?raw=true'},
                {'name': 'slice5', 'displayName': 'Slice 5', 'src': TEST_IMG_URL + 'slice5_A.png?raw=true'},
                {'name': 'slice6', 'displayName': 'Slice 6', 'src': TEST_IMG_URL + 'slice6_A.png?raw=true'},
            ],
            'selectedSlice': '',
        };
    },
    'components': {
        'list-autocomplete': ListAutocomplete,
    },
    'mounted': function() {
        this.firstImgElement = this.imagePoll[0];
        this.loadImage();
        // this.changeBasedClick();
    },
    'methods': {
        'hoverSelector': function(el) {
            this.loadImage(el);
        },
        'loadImage': function(element) {
            if (!element) {
                element = this.firstImgElement;
            }
            let image = this.$el.querySelector('#currentSliceImg');
            image.src = element.src;
            this.selectedSlice = element;
        },
        'changeBasedClick': function() {
            let changeImg = function(touched) {
                let next = this.getNext(touched.target);
                this.loadImage(next);
            };
            let container = this.$el.querySelector('#currentSliceImg');
            container.addEventListener('click', changeImg.bind(this));
        },
        'getNext': function(element) {
            let indexFound = this.imagePoll.findIndex((pollElements) => {
                return element.src == pollElements.src;
            });
            let nextIndex = indexFound + 1;
            if (this.imagePoll.length > nextIndex) {
                return this.imagePoll[nextIndex];
            }
            return this.firstImgElement;
        },
        'targetSelected': function() {
            this.$emit('targetSelected', this.selectedSlice);
        },
    },
};
</script>
<style scoped>
    .target-selection {
        display: flex;
        flex-direction: row;
    }
    .img-container {
        width: 200px;
    }
    img {
        position: absolute;
        width: 230px;
    }
    .autocomplete-container {
        margin: 0 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .autocomplete {
        height: 230px;
        overflow: scroll;
    }
</style>
