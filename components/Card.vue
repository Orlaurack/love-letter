<script setup>

const props = defineProps({
  card: Object,
  playable: Boolean,
  hover_effect: Boolean,
  key: Number,
  cards_length: Number,
  index: Number
})

const rotation = computed(()=>{
  const deg = 10
  if(props.cards_length<=1){
    return 0
  }
  let rotation = props.index / (props.cards_length - 1)
  rotation -= 0.5
  rotation *= deg
  return rotation
})


</script>
<template>
  <div style="--rotation: 0"  :style="'--rotation: rotate(' + rotation + 'deg)'">
    <div class="card" :class="{playable, hover_effect}" v-if="card">
      <div class="header"><b>{{card.value}}</b><span>{{card.title}}</span></div>
      <p class="description">{{card.description}}</p>
    </div>
    <div v-else class="card">
    </div>
    <slot></slot>
  </div>
</template>
<style lang="sass" scoped>
.card
  transition: 400ms
  border: 1px solid #0002
  width: 100px
  height: 180px
  background-color: white
  display: flex
  flex-direction: column
  padding: 0 
  cursor: default
  color: black
  transform: var(--rotation)
  z-index: 25
  &::hover
    transform: none !important
  
  .header
    padding: 6px 6px
    display: flex
    justify-content: space-between
    gap: 4px
    span
      margin: 0
  .description
    padding: 4px
    margin-top: auto
    margin-bottom: 0
    font-size: 10px
    padding-top: 4px
    background-color: #0001

  &.playable
    cursor: pointer
  &.hover_effect:hover
    transform: scale(1.3)
</style>