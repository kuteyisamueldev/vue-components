<template>
<div class="video-item" ref="videoContainer"  @dblclick="handleDoubleClick($event)">
  <div class="video-content">
      <video class="video-component" v-show="(!state.loading && !state.loadError) && !pictureInPictureActivated"
             ref="videoItem"
             width="600"
             height="450"
             @play="playVideo"
             @pause="pauseVideo"
             @ended="resetVideo"
             @loadeddata="setInitialVideoState"
             @error="setErrorState()"
             @waiting="state.buffering = true"
             @playing="state.buffering = false"
      >
          <source :src="videoLink" type="video/mp4">
          <source :src="videoLink" type="video/ogg">

          <div>Your browser does not support video.</div>
      </video>

      <div :class="['video-cover-image', { 'loaded-image': state.coverImageLoaded }]" v-if="coverImageLink && state.initialLoad">
          <img alt="Video cover"
               :src="coverImageLink"
               v-show="state.coverImageLoaded"
               @load="state.coverImageLoaded = true"
          />
      </div>

      <div :class="['controls', { 'in-view': !state.initialLoad }]" ref="controlBar" v-if="!state.loading && !state.loadError">
          <div class="video-range">
              <span class="time-data current-time">{{ currentTime }}</span>
              <div class="full-range">
                  <div class="preview-bar" :style="{left: `${previewVideoOffset}px`}" v-if="showPreviewBar">
                      <div class="preview-item">
                          <video class="preview-video" ref="previewVideo">
                              <source :src="videoLink" type="video/mp4">
                              <source :src="videoLink" type="video/ogg">

                              <div>Your browser does not support video.</div>
                          </video>

                          <span class="preview-timestamp" v-if="$refs.previewVideo">
                              {{ splitTime($refs.previewVideo.currentTime) }}
                          </span>
                      </div>
                  </div>
                  <range-slider
                          ref="timeSlider"
                          :min="0"
                          :max="videoDuration"
                          :value="watchTime"
                          @input="setVideoPosition($event)"
                          @change="resumeVideo"
                          @mousemove="showPreview($event)"
                          @mouseleave="hidePreviewBar"/>
              </div>
              <span class="time-data remaining-time">{{ remainingTime }}</span>
          </div>

          <div class="volume-section">
              <button @click="toggleVolume()">
                  <img alt="Modify video volume"
                       :src="volumeIcon"
                       class="volume-icon"/>
              </button>
              <range-slider
                      v-if="inFullscreen"
                      :min="0"
                      :max="100"
                      :value="volume"
                      @input="changeVolume($event)"
              />
          </div>
          <div class="skip-section">
              <button  @click="skipVideo('backward')">
                  <img alt="Skip backward"
                       :src="skipBackwardIcon"
                       class="skip-icon skip-reverse"
                       :class="{'skip-animate-reverse': animateReverse}"
                  />
              </button>

              <button @click="skipVideo('forward')">
                  <img alt="Skip forward"
                       :src="skipForwardIcon"
                       class="skip-icon skip-forward"
                       :class="{'skip-animate-forward': animateSkip}"
                  />
              </button>

          </div>

          <div class="setting-section">
              <ul class="settings-list" v-if="showVideoSettings">
                  <li v-for="(setting, index) in videoSettings"
                      :key="index"
                      :class="{
                          'switch-list': setting.type === 'switch',
                          'disabled-setting': setting.disabled
                      }"
                      @click="performAction(setting)"
                  >
                      <i v-if="setting.action === 'showPictureInPicture'" :class="[`bx ${setting.activated ? 'bx-window-close' : 'bx-window-open'} picture-in-picture`]"></i>
                      <span>{{ setting.name }}</span>
                      <ul class="setting-options" v-if="setting.type === 'list'">

                          <li v-for="(option, optionIndex) in setting.options"
                              :key="optionIndex"
                              :data-value="option.value"
                              @click="setOption(index, option.value)">
                              <span> {{ option.label }}</span>
                              <img alt="Setting checkmark"
                                   v-if="setting.value === option.value"
                                   :src="checkmarkIcon"
                                   class="checkmark-icon"
                              >
                          </li>
                      </ul>

                      <div v-if="setting.type === 'switch'">
                          <q-toggle v-model="setting.value"
                                    color="#5094DD"
                                    size="28px"
                                    @update:model-value="getState"
                          />
                      </div>
                  </li>
              </ul>
             <button class="setting-trigger" @click="showVideoSettings = !showVideoSettings">
                  <img alt="video settings" :src="gearIcon" class="gear-icon" >
             </button>
          </div>

          <button class="fullscreen-section" v-if="allowFullscreen">
              <img alt="fullscreen" :src="fullScreenIcon" class="fullscreen-icon" @click="inFullscreen = !inFullscreen">
          </button>
      </div>

      <button :class="[
          'play-button',
          {
              'loaded' : state.initialLoad || !playing
          }]"
              ref="playButton"
              @click="toggleVideo"
              v-if="!state.loading && !state.loadError && !state.buffering && !pictureInPictureActivated">
          <img alt="play video" v-if="!playing" src="../assets/icons/play.svg">
          <img alt="pause video" v-if="playing" src="../assets/icons/pause.svg">
      </button>

      <div class="loading-spinner"
           v-if="(state.loading && !state.loadError) || (state.buffering && !state.loadError)"></div>

      <div class="load-error-section" v-if="!state.loading && state.loadError">
          <i class="bx bx-error-circle"></i>
          <div class="load-error-text">An error occurred while loading this video.</div>
      </div>
  </div>

    <div :class="['picture-frame', { 'in-view': pictureInPictureActivated }]">
          <div class="frame-text">Playing in picture-in-picture mode</div>
          <button @click="requestPictureInPicture">Exit mode</button>
    </div>
</div>

<!--  <iframe :src="videoLink"></iframe>-->

</template>

<script>
import RangeSlider from "./RangeSlider";

export default {
  name: "VideoPlayer",
  props: {
    videoLink: {
        type: String,
        required: true
    },
    allowFullscreen: {
        type: Boolean,
        required: false,
        default: true
    },
    coverImageLink: {
        type: String,
        required: false
    },
    autoPlay: {
        type: Boolean,
        required: false,
        default: false
    }
  },
  components: {
    RangeSlider
  },

  mounted() {
     if (document.pictureInPictureElement) {
         document.exitPictureInPicture()
     }
  },
  unmounted() {
   // console.log('Unmounted')
    document.removeEventListener('fullscreenchange', this.handleExit)
   document.removeEventListener("keydown", this.handleKeyPress);
    document.removeEventListener("click", this.clickOutsideHandler);
    if (this.$refs.videoItem) {
        this.$refs.videoItem.removeEventListener('enterpictureinpicture', this.detectPictureInPictureEntry, false)
    }
  },
  data() {
    return {
      state: {
          loading: true,
          loadError: false,
          initialLoad: true,
          buffering: false,
          coverImageLoaded: false
      },
      playing: false,
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
          action: 'changePlaybackSpeed',
          type: "list",
          disabled: false,
          activated: false,
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
          action: 'loopVideo',
          type: 'switch',
          value: false,
          disabled: false,
          activated: false
        },
        {
            name: 'Picture-in-Picture',
            action: 'showPictureInPicture',
            disabled: false,
            activated: false
        }
      ],
      savedVolume: 85,
      playbackSpeed: 1,
      intervalLength: 1000,
      loopVideo: false,
      inFullscreen: false,
      savedState: false,
      previewVideoOffset: -70,
      showPreviewBar: false,
      loadingData: false,
      pictureInPictureActivated: false,
      bufferInterval: null
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
 /* computed: {
      bufferLength() {
          let video = this.$refs.videoItem;
          let buffered = video.buffered;
          let timeRanges = []
          if (video) {
              for (let i = 0; i < buffered.length; i++) {
                  timeRanges.push({ start: buffered.start(i), end: buffered.end(i) })
              }
          }


          return buffered
      }
  },*/
  methods: {
    getState(value) {
        this.loopVideo = value;
    },
    performAction(setting) {
        let { action, disabled, value } = setting;

        if (disabled) {
            return
        }

        switch (action) {
            case 'showPictureInPicture':
                this.requestPictureInPicture()
                break
            case 'changePlaybackSpeed':
                this.playbackSpeed = value
                break
            case 'loopVideo':
                setting.value = !setting.value;
                this.loopVideo = setting.value
                break
        }
    },

    requestPictureInPicture() {
        const video = this.$refs.videoItem;

        if (!video){
            return
        }

        if (!document.pictureInPictureElement) {
            video.requestPictureInPicture()
        } else {
            document.exitPictureInPicture()
        }
    },


    detectPictureInPictureEntry() {
        this.setActionState('showPictureInPicture', true);
        this.pictureInPictureActivated = true;
    },

    detectPictureInPictureExit() {
        this.setActionState('showPictureInPicture', false);
        this.pictureInPictureActivated = false;
    },

    setActionState(action, state) {
        this.videoSettings = this.videoSettings.map(setting => {
            if (setting.action && setting.action === action) {
                setting.activated = state;
            }
            return setting
        })
    },

    setErrorState() {
        this.state = {
            ...this.state,
            loading: false,
            loadError: true,
            initialLoad: false
        }
    },
    clickOutsideHandler(event) {
      if (event.target.closest(".setting-section") == null) {
        this.showVideoSettings = false
      }
    },
    setInitialVideoState() {
      if (this.$refs['videoItem']) {
          this.state = {
              ...this.state,
              loadError: false,
              loading: false,
              initialLoad: true
          }
        this.videoDuration = Math.round(this.$refs['videoItem'].duration);
        this.videoDuration = Math.round(this.$refs['videoItem'].duration);
        this.currentTime = this.splitTime(0)
        this.remainingTime = this.splitTime(this.videoDuration);

        this.$refs['videoItem'].volume = this.volume / 100;
        document.addEventListener("keydown" , this.handleKeyPress)
        document.addEventListener('fullscreenchange', this.handleExit);

        document.addEventListener("click", this.clickOutsideHandler);
        this.$refs.videoItem.addEventListener('enterpictureinpicture', this.detectPictureInPictureEntry, false);
        this.$refs.videoItem.addEventListener('leavepictureinpicture', this.detectPictureInPictureExit, false);

          if (this.autoPlay) {
              this.playVideo();
          }

         // console.log({ buffered: this.bufferLength })

          /*this.bufferInterval = setInterval(() => {
              console.log({ buffered: this.bufferLength })
          }, 1000)*/
      }
    },

    animateVideoSkip(direction) {
      if (direction === 'forward') {
        this.skipVideo('forward')
        this.animateSkip = true

        setTimeout(() => { this.animateSkip = false}, 500)
      }

      if (direction === 'backward') {
        this.skipVideo('backward');

        this.animateReverse = true
        setTimeout(() => { this.animateReverse = false}, 500)
      }
    },

    handleKeyPress(event) {
     // console.log('Event code:', event.code)
      if (event.code.toLowerCase() === 'arrowright') {
        this.animateVideoSkip('forward')
      }

      if (event.code.toLowerCase() === 'arrowleft') {
        this.animateVideoSkip('backward');
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




    },

    playVideo() {
      const video = this.$refs['videoItem'];
      if (video != null) {
        video.play()
        this.playing = !video.paused

        this.watchInterval = this.setVideoInterval(video);

        if (this.state.buffering) {
            this.state.buffering = false;
        }

          if (this.state.initialLoad) {
              this.state.initialLoad = false;
          }
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
      const video = this.$refs['videoItem'];
      this.watchTime = parseInt(timeValue)
      video.currentTime = this.watchTime;

      const previewVideo = this.$refs['previewVideo'];
      if (previewVideo) {
          previewVideo.currentTime = this.watchTime;
      }

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
        this.showPreviewBar = false;

      }, 100)
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
      this.videoSettings[index].value = value;

      this.performAction(this.videoSettings[index])
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

    },

    showPreview(event) {
      if (!this.showPreviewBar) {
        this.showPreviewBar = true
      }
      const video = this.$refs['videoItem'] , duration = video.duration;
      const slider = this.$refs['timeSlider'].$el;
      let  { left, width } = slider.getBoundingClientRect();
      let positionalDifference = event.clientX - left;
      let timePercentage = (positionalDifference / width) * 100;

        if (timePercentage < 0 || timePercentage > 100) {
            this.showPreviewBar = false;
            return
        }
      let timeElapsed = (timePercentage / 100) * duration;
      let timeStamp = Math.floor(timeElapsed);
      this.previewVideoOffset = positionalDifference - 70;

      let previewVideo = this.$refs['previewVideo'];
      if (previewVideo) {
          previewVideo.currentTime = timeStamp
      }
    },

    hidePreviewBar() {
      this.showPreviewBar = false
    },

    handleDoubleClick(event) {
      const controlBarPosition = this.$refs['controlBar'].getBoundingClientRect().top, clickOffset = 50,
            video = this.$refs['videoItem'], videoPosition = video.getBoundingClientRect().left, videoWidth = video.clientWidth;

      const leftClickPosition = (videoPosition + (videoWidth / 2)) - clickOffset,
            rightClickPosition = (videoPosition + (videoWidth / 2)) + clickOffset;

      if (event.clientY < controlBarPosition) {
        if (event.clientX < leftClickPosition) {
          this.animateVideoSkip('backward');
        }

        if (event.clientX > rightClickPosition) {
          this.animateVideoSkip('forward');
        }
      }
    }

  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/video-player.scss";
</style>
