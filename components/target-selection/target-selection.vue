<template>
    <div>
        <div class="title">Add targets using slices of the Hippocampus</div>
        <div class="target-selection">
            <section class="img-container">
                <img id="currentSliceImg">
            </section>
            <section class="autocomplete-container">
                <p
                v-for="(item, index) in imagePoll"
                @mouseover="hoverSelector(item)"
                @click="targetSelected(item)"
                class="list-item"
                >
                    <i class="plus-icon material-icons hidden">add</i>
                    <span>{{ item['displayName'] }}</span>
                </p>

            </section>
        </div>
    </div>
</template>

<script>
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
                {'name': 'FullCA1', 'displayName': 'FullCA1', 'src': TEST_IMG_URL + 'full_A.png?raw=true'},
            ],
            'selectedSlice': '',
        };
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
            image.classList.add('blur');
            image.src = element.src;
            this.selectedSlice = element;
            image.onload = function() {
                image.classList.remove('blur');
            };
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
        width: 160px;
    }
    img {
        position: absolute;
        width: 160px;
        transition: opacity 0.2s;
    }
    .blur {
        opacity: 0.5;
    }
    .autocomplete-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 170px;
        overflow: scroll;
    }
    .list-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 15px 15px 15px 0;
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
