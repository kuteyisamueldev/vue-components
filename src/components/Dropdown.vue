<template>
<div class="dropdown-container"
     >
  <div class="dropdown-input flexbox flex-align-center" @click="open = !open">
    <div class="dropdown-current" >{{ value }}</div>
    <i class="fas fa-chevron-down arrow-icon" :class="{'open': open}"></i>
  </div>
  <div class="dropdown-menu" v-if="open">
    <div class="top-menu">
      <div class="search-bar">
        <i class="fas fa-search search-icon"></i>
        <input class="form-field" v-model="search_value" placeholder="Search..">
      </div>
    </div>
    <ul
        class="dropdown-options"
        v-if="select_data.length > 0"
    >
      <li
          v-for="(item, index) in select_data"
          :key="index"
          :data-value="item.value"
          @click="emitValue(item)">
        {{ item.label }}
      </li>
    </ul>

    <div class="error-response" v-if="select_data.length === 0">
      No results.
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: "CustomDropDown",
  props: ['items', 'defaultValue'],
  mounted() {
    this.select_data = [...this.items];

    document.addEventListener("click", this.outsideClick, false)
  },
  unmounted() {
    document.removeEventListener("click", this.outsideClick, false)
  },
  data() {
    return {
      value: this.defaultValue ? this.defaultValue : this.items[0].label,
      open: false,
      search_value: '',
      select_data: []
    }
  },
  watch: {
    defaultValue() {
      this.value = this.defaultValue;
    },

    items() {
     // console.log('Item changed')
     this.select_data = this.items
    },

    search_value() {
      if (this.search_value === '') {
        this.select_data = this.items
      } else{
        this.select_data = this.items.filter(item => item.value.toLowerCase().includes(this.search_value.toLowerCase()))
      }
    }
  },

  methods: {
    clickAway() {
      this.open = false;
    },

    outsideClick(event) {
      if (event.target.closest(".dropdown-container") == null) {
        this.open = false
      }
    },

    emitValue(item) {
      this.value = item.label;
      this.$emit('valueChange', item.value)
      this.open = false;
      this.select_data = this.items;
      this.search_value = ''
    }
  }
}
</script>

<style scoped>
.dropdown-input{
  padding: 8px 14px;
  background: #FFFFFF;
  border: 1px solid rgba(80, 148, 221, .35);
  border-radius: 8px;
  justify-content: space-between;
}

.dropdown-input i{
  font-size: 11px;
}

.dropdown-container{
  width: 100%;
  position: relative;
  margin-top: 4px;
  color: var(--theme-blue-alt);
  cursor: pointer;
}

.dropdown-current{
  font-size: .85rem;
  margin-right: .8rem;
}

.dropdown-menu{
  position: absolute;
  width: 100%;
  min-width: 150px;
  top: 100%;
  left: 0;
  background: #FFFFFF;
  z-index: 999;
  border: 1px solid rgba(80, 148, 221, .35);
  max-height: 15rem;
  overflow-y: auto;
}

.dropdown-menu::-webkit-scrollbar{
  width: 5px;
  background: rgba(80, 148, 221, .15);
}

.dropdown-menu::-webkit-scrollbar-thumb{
  background: var(--theme-blue-alt);
  border-radius: 2.5px;
}

.top-menu{
  padding: .8rem 0;
  border-bottom: 1px solid rgba(80, 148, 221, .2);
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  left: 0;
  background: #FFFFFF;
}

.search-bar{
  margin: 0 auto;
  width: calc(100% - 1rem);
  position: relative;
}

.search-icon{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 10px;
}

.form-field{
  padding: 4px 28px;
  margin-top: 0;
  font-size: .85rem;
}

.dropdown-options{
  list-style: none;
  width: 100%;
  padding: 0;
  margin: 0;
}

.dropdown-options li, .error-response{
  padding: 8px 22px;
}

.dropdown-options li:hover{
  background: rgba(80, 148, 221, .65);
  color: #FFFFFF;
  cursor: pointer;
}

.arrow-icon{
  transform: rotate(0deg);
  transition: all .25s;
}

.arrow-icon.open{
  transform: rotate(180deg);
}
</style>