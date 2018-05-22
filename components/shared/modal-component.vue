<template>
  <transition
    v-if="localShow"
    name="modal">
    <div
      class="modal-mask"
      @click="clickOutside">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header"/>
            <span
              class="close-button"
              @click="close"><i class="material-icons">close</i></span>
          </div>

          <div class="modal-content">
            <slot name="content"/>
          </div>

          <div class="modal-footer">
            <slot name="footer"/>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ModalComponent',
  props: ['show'],
  data: function() {
    return {
      localShow: false,
    };
  },
  watch: {
    show: function(newVal) {
      this.localShow = newVal;
    },
  },
  created: function() {
    this.localShow = this.show;
    document.addEventListener('keydown', (e) => {
      if (this.show && e.keyCode == 27) {
        this.close();
      }
    });
  },
  methods: {
    close: function() {
      this.$emit('changeModalVisibility', false);
    },
    clickOutside: function(e) {
      if (e.target.className.indexOf('modal-wrapper') >= 0) {
        this.close();
      }
    },
  },
};
</script>

<style>
  .modal-mask {
    position: fixed;
    z-index: 4;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }
  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }
  .modal-container {
    max-width: 360px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    /* transition: all .3s ease; */
    font-family: Helvetica, Arial, sans-serif;
  }
  .modal-image {
    max-height: 75vh;
    max-width: 100vw;
    overflow: scroll;
  }
  .close-button {
    width: 28px;
    float: right;
    cursor: pointer;
  }
  .modal-header {
    text-align: center;
    color: #fff;
    background-color: #879fcb;
    letter-spacing: .5px;
    padding: 5px 10px;
    margin: 5px 5px;
    border-radius: 7px;
  }
  .modal-header h3 {
    color: #fff;
    display: inline;
    background-color: #879fcb;
  }
  .modal-body {
    margin: 20px 0;
  }

  .modal-default-button {
    float: right;
  }
  .modal-enter {
    opacity: 0;
  }
  .modal-leave-active {
    opacity: 0;
  }
  .modal-enter-active .modal-container {
    animation: showModal .3s;
  }
  .modal-leave-active .modal-container {
    animation: hideModal .3s;
  }

  @keyframes showModal {
    0% {  transform: scale(.7); }
    100% { transform: scale(1); }
  }
  @keyframes hideModal {
    0% { transform: scale(1); }
    100% { transform: scale(.4); }
  }
</style>
