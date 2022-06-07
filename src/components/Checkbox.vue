<template>
    <div ref="checkbox_main" @click="$emit('click')" class="custom-checkbox-container" :checked="checked" :color="color">
      <input type="checkbox" v-model="ticked">
      <span :style="{border: '1px solid ' + color}" class="checkmark"></span>
    </div>
</template>

<script>
//import {onMounted} from "vue";

export default {
  name: "CustomCheckbox",
  props: ['checked', 'color'],
  data() {
    return {
      ticked: !!this.checked
    }
  },

  watch: {
    checked() {
      this.ticked = !!this.checked;
      this.$refs.checkbox_main.style.setProperty('--checkbox-bg', this.color)
    // console.log({"New value": newVal, "Old value": oldVal})
    },

    ticked() {
      this.ticked ? this.$emit('checked') : null;
    }
  }
}
</script>

<style scoped>
.custom-checkbox-container{
  --checkbox-bg: #5094DD;
}

.custom-checkbox-container{
  display: block;
  cursor: pointer;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  width: 16px;
  height: 16px;
}

.custom-checkbox-container input{
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  cursor: pointer;
}

.custom-checkbox-container .checkmark{
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  background: transparent;
  border: 1px solid var(--theme-blue);
}

.checkmark:after{
  content: '';
  position: absolute;
  top: 0;
  left: 3px;
  width: 7px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  display: none;
}

.custom-checkbox-container input:checked ~ .checkmark{
  background: var(--checkbox-bg);
}

.custom-checkbox-container input:checked ~ .checkmark:after{
  display: block;
}

</style>