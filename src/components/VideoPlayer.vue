<template>
<div class="video-item" :class="{'loaded': this.mounted}" ref="videoContainer">
  <video class="video-component" ref="videoItem" width="600" height="450" @play="playVideo" @pause="pauseVideo"  @ended="resetVideo">
    <source :src="videoLink" type="video/mp4">
    <source :src="videoLink" type="video/ogg">

    <div>Your browser does not support video.</div>
  </video>

  <div class="controls">
    <div class="video-range">
      <span class="time-data current-time">{{ currentTime }}</span>
      <range-slider :min="0" :max="videoDuration" :value="watchTime" @onInput="setVideoPosition($event)" @onChange="resumeVideo"></range-slider>
      <span class="time-data remaining-time">{{ remainingTime }}</span>
    </div>

    <div class="volume-section">
      <img :src="volumeIcon" class="volume-icon" @click="toggleVolume()"/>
      <range-slider :min="0" :max="100" :value="volume" @onInput="changeVolume($event)" />
    </div>

    <div class="skip-section">
      <img :src="skipBackwardIcon" class="skip-icon skip-reverse right-margin-sm" :class="{'skip-animate-reverse': animateReverse}" @click="skipVideo('backward')">
      <img :src="skipForwardIcon" class="skip-icon skip-forward" :class="{'skip-animate-forward': animateSkip}" @click="skipVideo('forward')">
    </div>

    <div class="setting-section">
      <ul class="settings-list" v-if="showVideoSettings">
        <li v-for="(setting, index) in videoSettings" :key="index" :class="{'switch-list': setting.type === 'switch'}">
          <span>{{ setting.name }}</span>
          <ul class="setting-options" v-if="setting.type === 'list'">

            <li v-for="(option, optionIndex) in setting.options" :key="optionIndex" :data-value="option.value" @click="setOption(index, option.value)">
             <span> {{ option.label }}</span>
              <img v-if="setting.value === option.value" :src="checkmarkIcon" class="checkmark-icon">
            </li>
          </ul>

          <div v-if="setting.type === 'switch'">
            <q-toggle v-model="setting.value" color="#5094DD" size="28px"/>
          </div>
        </li>
      </ul>
      <img :src="gearIcon" class="gear-icon" @click="showVideoSettings = !showVideoSettings">
    </div>

    <div class="fullscreen-section">
      <img :src="fullScreenIcon" class="fullscreen-icon" @click="inFullscreen = !inFullscreen">
    </div>
  </div>

  <div class="play-button" ref="playButton" @click="toggleVideo">
    <img v-if="!playing" src="../assets/icons/play.svg">
    <img v-if="playing" src="../assets/icons/pause.svg">
  </div>
</div>

<!--  <iframe :src="videoLink"></iframe>-->

</template>

<script>
import RangeSlider from "@/components/RangeSlider";

export default {
  name: "VideoPlayer",
  props: {
    videoLink: String
  },
  components: {
    RangeSlider
  },
  mounted() {
   setTimeout(() => {
     this.mounted = true
     this.setInitialVideoState()

    this.$refs['videoItem'].volume = this.volume / 100;

      document.addEventListener("keydown" , this.handleKeyPress)
    document.addEventListener('fullscreenchange', this.handleExit);

      document.addEventListener("click", this.clickOutsideHandler)


   }, 1000)
  },
  unmounted() {
   // console.log('Unmounted')
    document.removeEventListener('fullscreenchange', this.handleExit)
   document.removeEventListener("keydown", this.handleKeyPress);
    document.removeEventListener("click", this.clickOutsideHandler)
  },
  data() {
    return {
      playing: false,
      mounted: false,
      watchTime: 0,
      watchInterval: null,
      videoDuration: 0,
      currentTime: '',
      remainingTime: '',
      volume: 85,
      volumeIcon: require(`../assets/icons/speaker.svg`),
      skipForwardIcon: require(`../assets/icons/skip-forward.png`),
      skipBackwardIcon: require(`../assets/icons/skip-reverse.png`),
      fullScreenIcon: require('../assets/icons/expand.svg'),
      gearIcon: require('../assets/icons/gear.svg'),
      checkmarkIcon: require('../assets/icons/checkmark.svg'),
      showVideoSettings: false,
      animateSkip: false,
      animateReverse: false,
      videoSettings: [
        {
          name: "Playback speed",
          type: "list",
          options: [
            {
              value: .5,
              label: '0.5x'
            },
            {
              value: 1,
              label: '1x'
            },
            {
              value: 1.5,
              label: '1.5x'
            },
            {
              value: 2,
              label: '2x'
            }
          ],
          value: 1
        },
        {
          name: 'Loop',
          type: 'switch',
          value: false
        }
      ],
      savedVolume: 85,
      playbackSpeed: 1,
      intervalLength: 1000,
      loopVideo: false,
      inFullscreen: false,
      savedState: false
    }
  },
  watch: {
   volume() {
     let volumeIcon = this.volume === 0 ? 'speaker-mute' : this.volume > 0 && this.volume <= 50 ? 'speaker-low' : 'speaker';
     this.volumeIcon = require(`../assets/icons/${volumeIcon}.svg`)
   },

   inFullscreen() {
   // console.log('In full screen:', this.inFullscreen)
     const container = this.$refs["videoContainer"]
     if (this.inFullscreen) {
       this.fullScreenIcon = require('../assets/icons/minimize.svg')
       if (container.requestFullscreen) {
         container.requestFullscreen()
       } else if (container.msRequestFullscreen) {
         container.msRequestFullscreen()
       } else if (container.mozRequestFullscreen) {
         container.mozRequestFullscreen()
       } else if(container.webkitRequestFullscreen) {
         container.webkitRequestFullscreen()
       }

     } else {
       this.fullScreenIcon = require('../assets/icons/expand.svg')
       if (document.fullscreenElement) {
         if (document.exitFullscreen) {
           document.exitFullscreen()
         } else if (document.msExitFullscreen) {
           document.msExitFullscreen()
         } else if (document.webkitExitFullscreen) {
           document.webkitExitFullscreen()
         }  else if (container.mozExitFullscreen) {
           document.mozExitFullscreen()
         }
       }
     }
   },


    videoSettings: {
      deep: true,
      handler() {
       const playbackSetting = this.videoSettings.find(setting => setting.name.toLowerCase() === 'playback speed');

       if (playbackSetting) {
         if (playbackSetting.value !== this.playbackSpeed) {
           this.playbackSpeed = playbackSetting.value
         //  console.log('Playback speed:', playbackSetting.value)
         }
       }

       const loopSetting = this.videoSettings.find(setting => setting.name.toLowerCase() === 'loop');

       if (loopSetting) {
         if (loopSetting.value !== this.loopVideo) {
           this.loopVideo = loopSetting.value
         }
       }


      }
    },

    playbackSpeed() {
      const video = this.$refs.videoItem, regularInterval = 1000;

      video.playbackRate = this.playbackSpeed;

      if (this.watchInterval != null) {
        clearInterval(this.watchInterval)
      }
     // this.intervalLength = this.playbackSpeed < 1 ? regularInterval + (regularInterval * this.playbackSpeed) : regularInterval * this.playbackSpeed;
     // this.intervalLength = regularInterval * this.playbackSpeed;

      let interval = this.playbackSpeed * regularInterval, intervalDifference = interval - regularInterval ;

      this.intervalLength = intervalDifference === 0 ? regularInterval : intervalDifference > 0 ? intervalDifference : regularInterval + interval

      this.setVideoInterval(video)
    }
  },
  /*computed: {

  },*/
  methods: {
    clickOutsideHandler(event) {
      if (event.target.closest(".setting-section") == null) {
        this.showVideoSettings = false
      }
    },
    setInitialVideoState() {
      this.videoDuration = Math.round(this.$refs['videoItem'].duration);
      this.currentTime = this.splitTime(0)
      this.remainingTime = this.splitTime(this.videoDuration);
    },

    handleKeyPress(event) {
     // console.log('Event code:', event.code)
      if (event.code.toLowerCase() === 'arrowright') {
        this.skipVideo('forward')
        this.animateSkip = true

        setTimeout(() => { this.animateSkip = false}, 500)
      }

      if (event.code.toLowerCase() === 'arrowleft') {
        this.skipVideo('backward');

        this.animateReverse = true
        setTimeout(() => { this.animateReverse = false}, 500)
      }

      if (event.code.toLowerCase() === 'arrowup') {
         if (this.inFullscreen) {
           this.increaseVolume()
         }
      }

      if (event.code.toLowerCase() === 'arrowdown') {
        if (this.inFullscreen) {
          this.reduceVolume()
        }
      }

      if (event.code.toLowerCase() === 'space') {
        if(event.target === document.body) {
          event.preventDefault()
        }

        this.toggleVideo()
      }
    },

    exitFullscreen() {
      this.inFullscreen = false
    },
    increaseVolume() {
      if (this.volume !== 100) {
        this.volume = this.volume + 10 > 100 ? 100 : this.volume + 10
        this.$refs['videoItem'].volume = this.volume / 100
      }
    },

    reduceVolume() {
      if (this.volume !== 0) {
        this.volume = this.volume - 10 < 0 ? 0 : this.volume- 10
        this.$refs['videoItem'].volume = this.volume / 100
      }
    },

    toggleVideo() {
      const video = this.$refs['videoItem'],  paused = video.paused;
/*
      console.log('Duration:', Math.round(video.duration))

      let seconds = [100, 289, 500, 300, 860, 400, 600, 3600, 80000];

      seconds.map(second => {
        console.log(this.splitTime(second))
      })*/

      if (paused) {
       this.playVideo()
      } else {
        this.pauseVideo()
      }


      if (this.mounted) { this.mounted = false }
    },

    playVideo() {
      const video = this.$refs['videoItem'];
      if (video != null) {
        video.play()
       this.playing = !video.paused

        this.watchInterval = this.setVideoInterval(video)
      }
    },

    pauseVideo() {
      const video = this.$refs['videoItem'];

      if (video != null) {
        video.pause();
        this.playing = !video.paused

        if (this.watchInterval != null) {
          clearInterval(this.watchInterval)
        }
      }
    },

    splitTime(seconds) {
     let breakdown = [];

      const breakTime = (seconds) => {
        let timeDivision =  Math.floor(seconds / 60);
        if (timeDivision >= 60) {
          let hourDivision = Math.floor(timeDivision / 60);
          breakdown.push(hourDivision);

          let newSeconds = seconds  % (60 * 60);

          breakTime(newSeconds)
        } else {
          breakdown.push(timeDivision);
          breakdown.push(seconds % 60)
        }
      }


     breakTime(seconds)

    breakdown = breakdown.map(item => {
      const singleItemString = item.toString().length === 1
      return singleItemString ? `0${item}` : parseInt(item).toString()
    })

      return breakdown.toString().replace(/,/g, ":");
    },

    setVideoInterval(video) {
      return setInterval(() => {
        this.watchTime = Math.round( video.currentTime );
        this.setTimeValues()
      }, this.intervalLength)
    },

    setTimeValues() {
      this.currentTime = this.splitTime(parseInt(this.watchTime));
      this.remainingTime = `${this.watchTime > 0 ? '-' : ''}` + this.splitTime(Math.round(this.videoDuration - this.watchTime))
    },

    setVideoPosition(timeValue) {
     // console.log('Current position:', this.watchTime)
      const video = this.$refs['videoItem'];
      this.watchTime = parseInt(timeValue)
      video.currentTime = this.watchTime;
      this.setTimeValues()

      video.pause()

      this.resetInterval()
    },

    resetInterval() {
      const video = this.$refs['videoItem'];
      if (this.watchInterval != null)  {
        clearInterval(this.watchInterval)
        this.watchInterval = this.setVideoInterval(video)
      }


    },

    resumeVideo() {
     // console.log('Video played')

      setTimeout(() => {
          //console.log('Video paused')
          this.playVideo()

      }, 2)
    },

    changeVolume(volume) {
      this.volume = parseInt(volume);
      this.$refs['videoItem'].volume = parseInt(volume) / 100
    },

    toggleVolume() {
      const video = this.$refs['videoItem'];

      if (this.volume === 0) {
        video.muted = false;
        video.volume = this.savedVolume / 100
        this.volume = this.savedVolume
      } else {
        video.muted = !video.muted;
      }

      if (video.muted) {
        this.savedVolume = this.volume;
        this.volume = 0;
      } else {

        this.volume = this.savedVolume > 0 ? this.savedVolume : 50
      }
      console.log('Video muted:', video.muted)
    },

    skipVideo(direction) {
    //  console.log('Function called')
      const video = this.$refs['videoItem'];

      if (video) {
        if (direction === 'forward') {
          video.currentTime += 10
          this.watchTime = video.currentTime;
          this.setTimeValues()
          clearInterval(this.watchInterval)
          if (video.currentTime+10 >= video.duration) {

            video.currentTime = 0;
            video.pause();

            if (this.loopVideo) {
              setTimeout(() => {
                video.play()
              }, 1000)
            }


          } else {
            video.currentTime += .5
            this.watchTime = video.currentTime;
            this.setTimeValues()
          }
        }

        if (direction === 'backward') {
          if (video.currentTime !== 0) {
            video.currentTime -= 10;
            this.watchTime = video.currentTime;
            this.setTimeValues()
          }
        }


        this.savedState = video.paused
        this.pauseVideo()

      //  console.log('Video paused', video)
      //  console.log('Video paused triggered')

        this.resetInterval();

        if (!this.savedState)  {setTimeout(() => {video.play()}, 2)}
      }
    },

    handleExit() {
      if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        this.inFullscreen = false
      }
    },

    setOption(index, value) {
      this.videoSettings[index].value = value
    },

    resetVideo() {
      clearInterval(this.watchInterval)
        this.pauseVideo()
     // console.log('Video ended')
      if (this.loopVideo) {
        setTimeout(() => {
          this.playVideo()
        }, 1000)
      }

    }
  }


}
</script>

<style scoped lang="scss">

$whiteFilter: invert(100%) sepia(16%) saturate(8%) hue-rotate(279deg) brightness(114%) contrast(100%);

.video-item{
  width: 100%;

  height: 450px;
  margin: 1rem auto;
  position: relative;
  transition: ease-in-out .3s;
  background: rgba(0, 0, 0, .7);
  .video-component{
    width: 100%;
    height: 100%;
  }

  @media screen and (min-width: 1024px) and (max-width: 1599px) {
    max-width: 600px;
  }

  @media screen and (min-width: 1600px) {
    max-width: 750px;
  }

  @media screen and (min-width: 750px) and (max-width: 1023px) {
    max-width: calc(85% - 5rem);
  }

  @media screen and (max-width: 749px) {
    max-width: calc(95% - 1.5rem);
  }

  .play-button{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -30%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--theme-blue-alt);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--white);
    font-size: 20px;
    transition: ease-in-out .3s;
    opacity: 0;
    &:hover{
      opacity: .5;
      background: var(--theme-blue);
      cursor: pointer;
      transform: translate(-50%, -50%) scale(1.2);
    }

    img{
      width: 20px;
      height: 20px;
      filter: $whiteFilter
    }
  }

  &:hover, &.loaded{
    .play-button{
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }


  .controls{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: .8rem .4rem;
    background: rgba(0, 0, 0, .8);
    display: flex;
    align-items: center;

    &:hover + .play-button{
      opacity: 0;
    }



    .video-range{
      display: flex;
      align-items: center;
      width: calc(80% - 10rem);


      .time-data{
        color: var(--white);
        font-size: .7rem;
        height: 100%;

        &.current-time{
          margin-right: .6rem;
        }

        &.remaining-time{
          margin-left: .6rem;
        }
      }
    }

    .volume-section{
      display: flex;
      align-items: center;

      .volume-icon{
        width: 15px;
        height: 15px;
        filter: $whiteFilter;
        margin-right: 10px;
        cursor: pointer;
        transition: .15s ease;

        &:hover{
          opacity: .6;
        }
      }
    }

    .skip-section{
      .skip-icon{
        width: 20px;
        height: 20px;
        filter: $whiteFilter;
        display: inline-block;
        vertical-align: middle;
        transition: ease-in-out .2s;
        cursor: pointer;

        &.skip-reverse:hover{
          transform: rotate(-15deg);
        }

        &.skip-forward:hover{
          transform: rotate(15deg);
        }

        &.skip-animate-reverse{
          animation: skipReverse .5s;
        }

       &.skip-animate-forward{
         animation: skipForward .5s;
       }

        @keyframes skipForward {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @-webkit-keyframes skipForward {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @-moz-keyframes skipForward {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @-o-keyframes skipForward {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @keyframes skipReverse {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(-15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @-webkit-keyframes skipReverse {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(-15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @-moz-keyframes skipReverse {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(-15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }

        @-o-keyframes skipReverse {
          0%{
            transform: rotate(0deg);
          }

          50%{
            transform: rotate(-15deg);
          }

          100%{
            transform: rotate(0deg);
          }
        }
      }
    }

    .fullscreen-section{
      .fullscreen-icon{
        width: 22px;
        height: 22px;
        filter: $whiteFilter;
        cursor: pointer;
        transition: ease-in-out .2s;
        display: inline-block;
        vertical-align: middle;

        &:hover{
          transform: scale(1.1);
        }
      }
    }

    .setting-section{
      position: relative;
      transition: ease-in-out .2s;
      padding: .2rem .4rem;
      cursor: pointer;

      &:hover{
        background: rgba(255, 255, 255, .25);
      }

      .gear-icon{
        display: inline-block;
        vertical-align: middle;
        width: 16px;
        height: 16px;
        filter: $whiteFilter
      }

      ul{
        background: var(--black);
        color: white;
        padding-left: 0;
        position: absolute;
        list-style: none;
        width: 120px;
      }

      .settings-list{
        bottom: 85%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99;
        li{
          padding: .4rem;
          line-height: 1.1rem;
          font-size: .75rem;
          position: relative;
          transition: ease-in-out .2s;
          font-weight: 600;

          &.switch-list{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: .2rem .4rem;
          }

          &:hover{
            background: rgba(255, 255, 255, .3);

            .setting-options{
              display: block;
            }
          }

          .setting-options{
           right: 100%;
            top: 4px;
            display: none;

            li{
              display: flex;
              align-items: center;
              justify-content: space-between;
              color: rgba(255, 255, 255, .85);
              padding: .4rem .5rem;

              .checkmark-icon{
                width: 11px;
                height: 11px;
                margin-right: .4rem;
                filter: $whiteFilter;
              }
            }
          }
        }
      }
    }

    @media screen and (max-width: 989px) {
      flex-wrap: wrap;
      .video-range{
        width: 100%;
        margin-bottom: 1rem;
      }

      .volume-section{
        max-width: 150px;
        margin-right: 1.2rem;
      }

      .skip-section{
        margin-right: .8rem;
      }

      .fullscreen-section{
        margin-left: auto;
      }
    }

    @media screen and (min-width: 990px) {
      justify-content: space-between;
      .volume-section{
        max-width: 100px;
      }
    }
  }
}



</style>