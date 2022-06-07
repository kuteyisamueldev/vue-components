<template>
  <div class="duration-slider">
    <input type="range" min="0" :max="max" v-model="rangeValue"  class="input-range" @input="emitInput" @change="emitChange">
    <div class="position-indicator" :style="{width:  `${(rangeValue / max) * 100}%`}"></div>
  </div>
</template>

<script>
export default {
  name: "RangeSlider",
  props: {
    min: Number,
    max: Number,
    value: Number
  },
  mounted() {
    this.rangeValue = this.value
  },
  watch: {
    value() {
      this.rangeValue = this.value
    }
  },
  data() {
    return {
      rangeValue: 0
    }
  },
  methods: {
    emitInput() {
      this.$emit('onInput', this.rangeValue)
    },

    emitChange() {
      this.$emit('onChange', this.rangeValue)
    }
  }
}
</script>

<style scoped  lang="scss">

.duration-slider{
  width: 100%;
  position: relative;
  margin-top: -6px;

  input{
    width: 100%;
    height: 2px;
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, .6);
    border-radius: 6px;
    transition: all .2s;
    outline: 0;
    cursor: pointer;

    &::-moz-range-thumb{
      width: 17px;
      height: 17px;
      background: var(--theme-blue-alt);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      z-index: 2;
      transition: all .3s;
      border: 1px solid var(--theme-blue-alt);
    }

    &::-webkit-slider-thumb{
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      width: 17px;
      height: 17px;
      background: var(--theme-blue-alt);
      border-radius: 50%;
      transition: all .3s;
      cursor: pointer;
      position: relative;
      z-index: 2;
    }

    &:hover{
      & + .position-indicator,  &::-webkit-slider-thumb{
        background: var(--theme-blue);
      }
    }
  }
}

.position-indicator{
  position: absolute;
  top: 69.3%;
  transform: translateY(-69%);
  left: 0;
  width: 0;
  height: 2px;
  background: var(--theme-blue-alt);
  z-index: 1;
}
</style>