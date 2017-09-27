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
            >{{ item[selector] }}</p>
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
    .list-item:hover {
        background-color: #f6f0f1;
        border-radius: 5px;
    }
</style>