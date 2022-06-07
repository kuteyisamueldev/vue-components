<template>
  <label class="switch" :checked="checked">
    <input type="checkbox" v-model="filled" @click="filled = !filled">
    <span class="slider rounded"></span>
  </label>
</template>

<script>
export default {
  name: "Switch",
  props: ['checked'],
  data() {
    return {
      filled: this.checked
    }
  },
  watch: {
    filled() {
      //console.log(this.filled)
      this.$emit('filled', this.filled)
    },

    checked() {
      this.filled = this.checked
    }
  }
}
</script>

<style scoped>
.switch{
  position: relative;
  display: inline-block;
  width: 50px;
  height: 29px;
}

.switch input{
  opacity: 0;
  width: 0;
  height: 0;
}

.slider{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cccccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before{
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background: var(--white);
  -webkit-transition: .4s;
  transition: .4s;
}

input:hover + .slider{
  cursor: pointer;
}

input:checked + .slider {
  background-color: #1278D4;
}

input:focus + .slider {
  box-shadow: 0 0 1px #1278D4;
}

input:checked + .slider:before {
  -webkit-transform: translateX(22px);
  -ms-transform: translateX(22px);
  transform: translateX(22px);
}

.slider.rounded {
  border-radius: 22px;
}

.slider.rounded:before {
  border-radius: 50%;
}
</style>