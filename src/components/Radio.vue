<template>
<div class="data-radio">
    <input :id="inputId"
           type="radio"
           v-model="checkValue"
           @change="detectChange($event)"
           :value="value"
           :name="name"
           ref="inputRadio"
    />

    <div class="radio-container" @click="$emit('update:modelValue', value)">
        <div class="radio-icon"></div>
    </div>
</div>

</template>

<script>
export default {
    name: "Radio",
    props: {
        inputId: {
            type: String,
            required: true
        },
        value: {},
        modelValue: {},
        name: {
            type: String
        }
    },
    emits: [
        'update:modelValue',
        'change'
    ],
    mounted() {
        this.checkValue = this.modelValue;
       /* let component = this;
        setTimeout(function () {
            component.setRadioState()
        }, 100)*/
        //console.log({ modelValue: this.modelValue, value: this.value, checkValue: this.checkValue })
    },
    watch: {
        modelValue(current) {
            this.checkValue = current
        }
    },
    data() {
        return {
            checkValue: ''
        }
    },
    methods: {
        /*setRadioState() {
            let radio = this.$refs.inputRadio;
            this.$refs.inputRadio.checked = this.value === this.modelValue
           console.log({ equal: this.value === this.modelValue, value: this.value, modelValue: this.modelValue })
        },*/


        detectChange(event) {
            this.$emit('update:modelValue', event.target.value);
            this.$emit('change', event)
        }
    }
}
</script>

<style scoped>
.data-radio input{
    display: none;
}

.radio-container{
    width: 18px;
    height: 18px;
    border-radius: 50%;
    position: relative;
    border: 2px solid #ced4da;
    transition: ease-in-out .15s;
}

.radio-container:hover{
    border: 2px solid #24588D;
    cursor: pointer;
}
.radio-container .radio-icon{
    width: 9px;
    height: 9px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: #24588D;
    transition: ease-in-out .15s;
}

.data-radio input:checked + .radio-container{
    background: #24588D;
    border: 2px solid #24588D;
    box-shadow: 0 0 1px  rgba(36, 88, 141, .09), 0 0 1px 1px rgba(80, 148, 221, .25), 0 0 1px 1px rgba(80, 148, 221, .3);
}

.data-radio input:checked + .radio-container .radio-icon{
    transform: translate(-50%, -50%) scale(1);
    background: #FFFFFF;
}
</style>
