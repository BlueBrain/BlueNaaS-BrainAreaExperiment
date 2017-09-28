<!-- <list-autocomplete
    :list="imagePoll"
    selector="name"
    displaySelector="displayName"
    placeholder="Slice"
    class="autocomplete"
    @hover="hoverSelector"
    @clicked="targetSelected"></list-autocomplete> -->
<template>
    <div>
        <input class="query" v-model="query" @keyup.enter="enterClick">
        <transition-group name="staggered" class="container">
            <p
            v-for="(item, index) in computedList"
            v-bind:key="item[selector]"
            v-bind:data-index="index"
            @mouseover="hover(item)"
            @click="clicked(item)"
            class="list-item"
            >
                <i class="plus-icon material-icons hidden">add</i>
                <span>{{ item[displaySelector] }}</span>
            </p>
        </transition-group>
    </div>
</template>

<script>
export default {
    'name': 'staggered-list-demo',
    'props': {
        'list': [],
        'selector': String,
        'displaySelector': String,
    },
    'data': function() {
        return {
            'query': '',
        };
    },
    'computed': {
        'computedList': function() {
            let vm = this;
            let filtered = this.list.filter(function(item) {
                return item[vm.selector].toLowerCase().indexOf(vm.query.toLowerCase()) !== -1;
            });
            return filtered;
        },
    },
    'methods': {
        'hover': function(el) {
            this.$emit('hover', el);
        },
        'enterClick': function() {
            this.$emit('hover', this.computedList[0]);
        },
        'clicked': function(el) {
            this.$emit('clicked', el);
        },
    },
};
</script>

<style scoped>
    .query {
        width: 95%;
        border-radius: 4px;
        border-style: groove;
    }
    .container {
        text-align: center;
    }
    .staggered-enter-active, .staggered-leave-active {
        transition: all 0.5s;
    }
    .staggered-enter, .staggered-leave-to {
        opacity: 0;
        transform: translateY(30px);
    }
    .list-item {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 5px 0;
        padding-right: 10px;
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