<template>
    <div class="show-slider relative"
         @mouseenter="clearTimeout()"
         @mouseleave="checkForAutoSlide()"
         ref="sliderContainer"
    >

        <div class="w-full relative">
            <div class="slider-container relative">
                <div class="slider-main"
                     :style="{
                    transition: `${ transition.duration > 0 ? `ease ${transition.duration}s` : 'none' }`,
                    transform: `translateX(-${getTranslatePosition()}px)`
             }"
                >
                    <div v-for="(item, index) in sliderList"
                         :key="index"
                         :class="['slider-item', { 'cloned' : item.cloned }]"
                         :style="{
                     width: `${width}px`
                 }"
                    >
                        <slot name="sliderItem" :item="item"></slot>
                    </div>
                </div>
            </div>
            <div class="slider-controls" v-if="showArrows && this.sliderList.length > this.items">
                <button
                    :disabled="!infinite && (this.transition.index === 0)" class="arrow-left" @click="moveLeft">
                    <i class="pi pi-angle-left"></i>
                </button>

                <button
                    :disabled="!infinite && (this.transition.index + 1 > this.totalSlides-1)" class="arrow-right" @click="moveRight">
                    <i class="pi pi-angle-right"></i>
                </button>
            </div>


        </div>



        <div class="slider-dots mt-7 mx-auto" v-if="totalSlides > 1 && showDots">
            <span v-for="(dot, index) in new Array(totalSlides).fill('')"
                  :key="index"
                  :class="['pointer-dot', {'active-dot': index === transition.index }]"
                  @click="moveToIndex(index)"
            >
            </span>
        </div>
    </div>
</template>

<script>
import {cloneDeep, debounce} from "lodash";
import {getBreakpointItems} from "~/helpers/helperFunctions";

export default {
    name: "SlideShow",
    props: {
        slideshowItems: {
            type: Array,
            required: true
        },
        itemsPerSlide: {
            type: Number,
            required: false,
            default: 4
        },
        slideDuration: {
            type: Number,
            required: false,
            default: .5
        },
        infinite: {
            type: Boolean,
            required: false,
            default: true
        },
        automate: {
            type: Boolean,
            required: false,
            default: false
        },
        automateWait: {
            type: Number,
            required: false,
            default: 5
        },
        showArrows: {
            type: Boolean,
            required: false,
            default: true
        },
        showDots: {
            type: Boolean,
            required: false,
            default: true
        },
        breakPoints: {
            type: Object,
            required: false,
        },
        displayMode: {
            type: String,
            default: 'desktop'
        }
    },
    mounted() {
        this.createSlideList()
        this.items = this.itemsPerSlide;
        this.transition.duration = this.slideDuration;

        if (this.automate) {
            this.automateSlide();
        }

        this.setItemsPerPage()
        this.checkForResize()
        window.addEventListener('resize', this.setItemsPerPage)
    },
    unmounted() {
        window.removeEventListener('resize', this.setItemsPerPage)
    },
    data() {
        return {
            items: 4,
            sliderList: [],
            width: 0,
            transition: {
                index: 0,
                duration: .5,
                slideTimeout: 5000
            },
            animationTimeout: null,
        }
    },
    watch: {
        slideshowItems: {
            deep: true,
            handler() {
                this.createSlideList()
                this.resetSlider();
            }
        },
        itemsPerSlide() {
            this.items = this.itemsPerSlide;
            this.resetSlider()
        },
        slideDuration(value) {
            this.transition.duration = value
        },
        automate(value) {
            if (value) {
                this.resetSlider()
            } else {
                this.clearTimeout()
            }
        },
        infinite() {
           this.resetSlider()


        },
        automateWait() {
            this.resetSlider()
        },
        breakPoints: {
            deep: true,
            handler() {
                this.setItemsPerPage();
                this.resetSlider()
            }
        },
        displayMode() {
            this.setItemsPerPage()
        }
    },
    computed: {
        slideEnd() {
            return (this.transition.index + 1) * this.items
        },
        totalSlides() {
            let sliderList = this.sliderList.filter(item => !item.cloned)
            let total = Math.round(sliderList.length / this.items);
            if (total * this.items < sliderList.length) {
                total += 1
            }

            return total
        }
    },
    methods: {
        checkForResize() {
            let component = this;

            setTimeout(function () {
                let container = component.$refs.sliderContainer;

                let observer = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                       component.setItemsPerPage();
                       component.debounceReset();

                    }
                })

                if (container) {
                    observer.observe(container)
                }

            }, 0)
        },

        debounceReset: debounce(function () {
             this.clearTimeout();
               if (this.automate) {
                   this.automateSlide()
               }
        }, 250),

        calculateWidth() {
            let sliderContainer = this.$refs.sliderContainer;
            if (!sliderContainer) {
                return 0
            }

            let bodyWidth = document.body.clientWidth;
            let containerWidth = sliderContainer.clientWidth < bodyWidth ? sliderContainer.clientWidth : bodyWidth;
            if (this.displayMode !== 'desktop') {
                containerWidth = this.getSliderWidth();
            }



            // console.log({ sliderContainer: sliderContainer.getBoundingClientRect().width, items: this.items, width, body: document.body.clientWidth })

            return ((1 / this.items) * containerWidth) - 16
        },

        getSliderWidth() {
            let sliderWidth = 0;
            if (this.displayMode !== 'desktop') {
                let pageContainer = document.querySelector(`.collection-page-container.in-responsive-mode .collection-page.${this.displayMode}-view .page-content .collection-type-grid`);
                if (pageContainer) {
                    let pageSlider = pageContainer.querySelector('.show-slider')
                    sliderWidth = pageSlider && pageSlider.clientWidth < pageContainer.clientWidth ? pageSlider.clientWidth : pageContainer.clientWidth;

                   // console.log({ sliderWidth, pageContainer: pageContainer.clientWidth, pageSlider: pageSlider.clientWidth })
                }
            } else {
                let sliderContainer = this.$refs.sliderContainer;
                if (sliderContainer) {
                    sliderWidth = sliderContainer.clientWidth;
                }
            }

            return sliderWidth
        },

        getTranslatePosition() {
            let sliderContainer = this.$refs.sliderContainer;
            if (!sliderContainer) {
                return 0
            }

            let containerWidth = this.getSliderWidth();

            return containerWidth * this.transition.index;
        },
        moveLeft() {
            this.clearTimeout();
            this.slideLeft()
        },
        moveRight() {
            this.clearTimeout();
            this.slideRight()
        },
        completeSlideItems(sliderList) {
            let missingItems = this.items - (sliderList.length % this.items);

            if (missingItems < this.items && sliderList.length > this.items) {
                let clonedItems = sliderList.slice(0, missingItems);
                sliderList = [
                    ...sliderList,
                    ...clonedItems
                ]
            }
            return sliderList
        },
        createSlideList() {
            let slideItems = cloneDeep(this.slideshowItems);

            if (this.infinite) {
                slideItems = this.completeSlideItems(slideItems)
            }


           this.sliderList = slideItems;
        },

        automateSlide() {
            if (this.animationTimeout) {
                window.clearTimeout(this.animationTimeout);
                this.animationTimeout = null
            }

           // this.resetSlider();
            let animationWait = this.automateWait ? this.automateWait : 5;

            let component = this;
            this.animationTimeout = window.setTimeout(function () {
               component.slideRight();
            }, animationWait * 1000)
        },

        slideLeft() {
            let component = this;
            if (this.transition.index - 1 >= 0) {
                this.transition = {
                    ...this.transition,
                    index: this.transition.index - 1,
                    duration: this.slideDuration
                }

                window.setTimeout(function () {
                    component.checkForAutoSlide()
                }, this.slideDuration * 1000)
            } else {

                if (this.infinite) {
                    let clonedSliderItems = cloneDeep(this.sliderList.slice(this.sliderList.length-this.items, this.sliderList.length)).map(item => {
                        item.cloned = true
                        return item
                    })

                    this.sliderList = [
                        ...clonedSliderItems,
                        ...this.sliderList
                    ]
                    this.transition = {
                        ...this.transition,
                        index: this.transition.index + 1,
                        duration: 0
                    }

                    let component = this;
                    window.setTimeout(function () {

                        component.transition = {
                            ...component.transition,
                            index: component.transition.index - 1,
                            duration: component.slideDuration
                        }


                        window.setTimeout(function () {
                            component.sliderList = component.sliderList.filter(item => !item.cloned);
                            let index = component.totalSlides - 1;
                            component.transition = {
                                ...component.transition,
                                index,
                                duration: 0
                            }

                            component.checkForAutoSlide();
                        }, component.slideDuration * 1000)
                    }, 0)
                }
            }
        },

        checkForAutoSlide() {
            if (this.automate) {
                let component = this;
                let animationWait = this.automateWait ? this.automateWait : 5;
                this.clearTimeout()
               this.animationTimeout = window.setTimeout(function () {
                   component.slideRight()
               }, animationWait * 1000)
            }
        },
        slideRight() {
            let component = this;
            if (this.transition.index + 1 < this.totalSlides) {
                this.transition = {
                    ...this.transition,
                    index: this.transition.index + 1,
                    duration: this.slideDuration
                }


                window.setTimeout(function () {
                    component.checkForAutoSlide()
                }, this.slideDuration * 1000)

            } else {
                if (this.infinite) {
                    let clonedSliderItems = cloneDeep(this.sliderList.slice(0, 4)).map(item => {
                        item.cloned = true
                        return item
                    });

                    this.sliderList = [
                        ...this.sliderList,
                        ...clonedSliderItems
                    ];

                    this.transition = {
                        ...this.transition,
                        index: this.transition.index + 1,
                        duration: this.slideDuration
                    }

                    let component = this;
                    window.setTimeout(function () {
                        component.transition = {
                            ...component.transition,
                            index: 0,
                            duration: 0
                        }

                        component.sliderList = component.sliderList.filter(item => !item.cloned);
                        component.checkForAutoSlide();
                    }, component.slideDuration * 1000)
                }
            }
        },

        clearTimeout() {
            if (this.animationTimeout) {
                window.clearTimeout(this.animationTimeout);
                this.animationTimeout = null;
            }
        },
        resetSlider() {
            this.clearTimeout()
            this.transition = {
                ...this.transition,
                index: 0,
                duration: 0
            }

            if (this.automate) {
                this.automateSlide();
            }
        },

        moveToIndex(index) {
            this.clearTimeout();
            this.transition = {
                ...this.transition,
                index,
                duration: this.slideDuration
            }

            let component = this;
            window.setTimeout(function () {
                component.checkForAutoSlide()
            }, this.slideDuration * 1000)
        },
        setItemsPerPage() {
            let items = this.items
            if (this.breakPoints && Object.keys(this.breakPoints).length > 0) {
                let pageWidth;

               switch (this.displayMode) {
                   case 'desktop':
                       pageWidth = window.innerWidth;
                       break
                   case 'tablet':
                       pageWidth = 850;
                       break
                   case 'mobile':
                       pageWidth = 480;
                       break
               }
                items = getBreakpointItems(this.breakPoints, this.items, pageWidth);

            }

            if (items !== this.items) {
                this.items = items;
            }

           // console.log({ items: this.items * this.transition.index })
           /* if ((this.items * this.transition.index) >= this.sliderList.length) {
                this.resetSlider();
            }*/
            this.resetSlider();
            this.width = this.calculateWidth();
           // console.log({ width: this.width, calc: this.calculateWidth() })
        }
    }
}
</script>

<style scoped>
.slider-container{
    width: 100%;
    overflow-x: hidden;
    min-height: 350px;
}

.show-slider .slider-controls button{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: ease-in-out .15s;
}

.show-slider .slider-controls button i{
    font-size: 25px;
    color: var(--slider-arrow-colors);
    font-weight: 700;
    width: 35px;
    height: 35px;
    background: transparent;
    border-radius: 50%;
    transition: ease-in-out .15s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.show-slider .slider-controls button i:hover{
  /*  background: var(--slider-arrow-colors);
    color:#FFFFFF;*/
    opacity: .5;
}

.show-slider .slider-controls button.arrow-right{
    right: 0;
}

.show-slider .slider-controls button.arrow-left{
    left: 0;
}

/*@media screen and (max-width: 1024px) {
    .show-slider .slider-controls button.arrow-right{
        right: -10px;
    }

    .show-slider .slider-controls button.arrow-left{
        left: -10px;
    }
}*/

/*@media screen and (min-width: 1024px) {
    .show-slider .slider-controls button.arrow-right{
        right: -25px;
    }

    .show-slider .slider-controls button.arrow-left{
        left: -25px;
    }
}*/

.show-slider .slider-controls button:disabled{
    opacity: .5;
    cursor: not-allowed;
}
.slider-main{
    display: inline-flex;
    flex-wrap: nowrap;
    justify-content:center;
}

.slider-main .slider-item{
    margin: 0 8px;
    flex: 0 0 auto;
    background: var(--slider-item-bg);
    color: var(--slider-item-text-color);
    border-radius: 12px;
    padding: 1.5rem 1.35rem;
    max-width: 100%;
}

.slider-dots{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: fit-content;
    width: -moz-fit-content;
    padding: 0 .5rem;
}

.slider-dots .pointer-dot{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: block;
    transition: ease-in-out .15s;
    cursor: pointer;
    flex: 0 0 auto;
    margin: .4rem .3rem;
}

.slider-dots .pointer-dot:not(.active-dot) {
    background: var(--slider-dot-bg);
}

.slider-dots .pointer-dot:not(.active-dot):hover{
    background: var(--slider-dot-active-bg);
    opacity: .7;
}

.slider-dots .pointer-dot.active-dot{
    background: var(--slider-dot-active-bg);
}


</style>
