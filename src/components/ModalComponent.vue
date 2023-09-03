<template>
<Teleport to="body">
    <div v-if="displayModal" :class="[`data-modal ${modalClass}`, {
        'modal-in-view': addTransitionClass
    }]">
        <div :class="[
            'data-modal-container',
             {
                 'content-center': contentPosition === 'center'
             }]">

            <div class="data-modal-item">
                <div class="data-modal-header">
                    <slot name="header"></slot>

                    <button @click="closeModal" class="close-icon">
                        &times;
                    </button>
                </div>

                <div class="data-modal-body">
                    <slot name="body" v-if="$slots.body"></slot>
                </div>

                <div v-if="$slots.footer" class="data-modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>

        </div>
    </div>
</Teleport>
</template>

<script>
export default {
    name: "ModalComponent",
    props: {
        visible: {
            type: Boolean
        },
        contentPosition: {
            type: String,
            default: "center"
        },
        modalClass: {
            type: String,
            required: false
        }
    },
    emits: [
        'update:visible',
        'open',
        'close'
    ],
    computed: {
        displayModal() {
            return this.visible ? this.visible : this.display
        }
    },
    mounted() {
        this.setModalState();
        document.addEventListener('click', this.detectOutsideClick)
    },
    unmounted() {
        document.removeEventListener('click', this.detectOutsideClick)
    },
    data() {
        return {
            addTransitionClass: false,
            display: false
        }
    },
    watch: {
        visible() {
            this.setModalState()
        }
    },
    methods: {
        detectOutsideClick(e) {
           if (this.display && !e.target.closest(".data-modal .data-modal-item"))  {
               this.closeModal()
           }
        },
        setModalState() {
            let component = this;
            let timeout = component.visible ? 0 : 250;

            if (!component.visible) {
                component.addTransitionClass = false;
            } else {
                this.$emit('open')
            }

            setTimeout(function () {
                if (component.visible) {
                    component.addTransitionClass = true;
                    component.display = true
                } else {
                    component.display = false;
                    component.$emit('close')
                }
            }, timeout)
        },

        closeModal() {
            this.$emit('update:visible', false)
        }
    }
}
</script>

<style scoped>
.data-modal{
    background: rgba(36, 88, 141, .1);
    width: 100%;
    height: 100vh;
    backdrop-filter: blur(0);
    transition: ease-in-out .25s;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
}

.data-modal.modal-in-view{
    backdrop-filter: blur(3px);
    background: rgba(36, 88, 141, .65);
}

.data-modal .data-modal-container{
    width: 100%;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.data-modal .data-modal-container.content-center{
    justify-content: center;
}

.data-modal .data-modal-container .data-modal-item{
    border-radius: 12px;
    background: #FFFFFF;
    transform: translateY(-50px);
    opacity: 0;
    transition: ease-in-out .25s;
    min-width: 520px;
    max-width: calc(100% - .5rem);
    box-shadow: 0 0 2px 4px rgba(80, 148, 221, .15), 0 0 3px 5px rgba(36, 88, 141, .2);
}

.data-modal.modal-in-view .data-modal-container .data-modal-item {
    opacity: 1;
    transform: translateY(0);
}

.data-modal-container .data-modal-item .data-modal-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem;
}

.data-modal-container .data-modal-item .data-modal-header .close-icon{
    width: 30px;
    height: 30px;
    font-size: 2rem;
    transition: ease-in-out .15s;
    border-radius: 50%;
    background: transparent;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: -5px;
    font-weight: 600;
}

.data-modal-container .data-modal-item .data-modal-header .close-icon:hover{
    border: 1px solid var(--theme-blue);
    color: var(--theme-blue);
    outline: 0;
}

.data-modal-container .data-modal-item .data-modal-footer{
    padding: 1rem 1.2rem;
}

.data-modal-container .data-modal-item .data-modal-body{
    padding: 1rem 1.2rem;
    max-height: calc(75vh - 80px);
    overflow-y: auto;
}
</style>
