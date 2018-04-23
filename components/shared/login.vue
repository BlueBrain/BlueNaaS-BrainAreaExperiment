<template>
  <div>&#32</div>
</template>


<script>
  import {isAuth} from 'assets/hbp.hello.js';
  export default {
    'name': 'login',
    'mounted'() {
      isAuth().then(() => {
        console.debug('Redirect to / from /login');
        this.$router.replace('/');
      });
    },
  };
</script>