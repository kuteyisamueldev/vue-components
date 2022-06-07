<template>
  <div class="video-item-container">
    <div class="text-center bold-text text-md">Video player vue component</div>
    <VideoPlayer :video-link="vidLink" class="centered-item"></VideoPlayer>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

import VideoPlayer from "@/components/VideoPlayer";
export default {
  name: 'App',
  components: {
    VideoPlayer
  },
  data() {
    return {
      vidLink: require('./videos/sales_analysis.mp4')
    }
  }
}
</script>

<style>
@import "assets/css/base.css";
/*#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}*/

.video-item-container{
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
