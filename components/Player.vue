<script setup>

const props = defineProps({
  deck: Array,
  value: Object,
  playerIndex: Number,
  playing: Number,
  turn: Number,
  key: Number,
  is_myself: Boolean,
  is_turn: Boolean,
  is_winner: Boolean,
  state: String,
  simplified: Boolean,
  rotation: String
})
// cardLength = ref(0) mounted get
const cardLength = computed(()=>{
  let length = 0
  
  length += props.is_turn ? 2 : 1

  length = props.deck[props.playing]?.name == 'Chancellor' ? 3 : length

  return props.is_myself ? 0 : length 
})
</script>

<template>
  <div class="player" :class="{
    is_protected: value?.protected,
    is_spy: value?.spy,
    is_host: value?.host,
    is_myself,
    is_turn,
    is_winner,
    is_ready: value?.is_ready,
    is_not_ready: value?.is_ready == false,
    is_loose: value?.loose,
  }">
    <span class="pseudo" :style="{'--rotation': rotation}">{{ value?.name }} ({{playerIndex}})</span>
    <span v-for="index in value.score" :key="index">♥</span>
    <div class="hand" v-if="!simplified && !value?.loose">
      <Card 
        v-if="!is_myself && is_turn && playing" 
        :cards_length="1" 
        class="playing"
        :card="deck[playing]"
      />
      <Card 
        v-for="index in cardLength"
        :key="index" 
        :index="index"
      />
    </div>
    <slot></slot>
  </div>
</template>

<style lang="sass">
.player
  --rotation: 0deg
  width: 200px
  padding: 20px
  position: relative
  .pseudo
    position: absolute
    white-space: nowrap
    left: 50%
    transform: translateX(-50%) rotate(var(--rotation))

  &.is_protected
    color: DeepSkyBlue
  &.is_spy
    color: mediumslateblue
  &.is_host .pseudo::before
    content: '(admin) '
    margin-right: 5px
    font-size: 10px
  &.is_myself 
    border-color: blue
  &.is_ready
    color: green
    background-color: lightgreen
  &.is_not_ready 
    background-color: lightgray
  &.is_turn
    .pseudo
      &::after
        content: ''
        background-color: DodgerBlue
        box-shadow: 0 0 15px DodgerBlue
        border-radius: 40px
        height: 10px
        width: 10px
        margin-left: 10px
        position: absolute
  &.is_loose
    opacity: 30%

  .hand
    margin-top: 100px
    display: flex
    flex-direction: row
    justify-content: center
    gap: 12px
    .playing
      transform: translateY(-40px)
  // .message
  //   position: absolute
  //   bottom: 0
</style>