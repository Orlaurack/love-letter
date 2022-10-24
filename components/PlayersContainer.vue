<script setup>

const props = defineProps({
  dynamic_players: Array,
  deck: Object,
  discard: Array,
  state: String,
  myself_index: Number,
  myself: Object,
  selected: Number, 
  player_turn: Number,
  winner: Number,
})

const deg = (index => {
  const length = props.dynamic_players.length-2
  if(length == 0) return 180

  let max = 45
  if(length >= 2) max = 90
  if(length >= 4) max = 110
  if(length >= 6) max = 130

  index/=length
  index*=2
  index--
  index*=max
  index+=180
  
  return index
})

const position = (deg => {
  deg *= -1
  deg /= 180 
  deg *= Math.PI
  const x = Math.cos(deg) * 30
  const y = Math.sin(deg) * 45

  return `${y}vw, ${x}vh`
})

const sortedPlayers = (players => {
  return props.dynamic_players.sort((a, b) => {
    if(a.index > props.myself_index && b.index > props.myself_index){
      return a.index - b.index
    } else if(a.index > props.myself_index){
      return -1
    } else if(b.index > props.myself_index){
      return 1
    } else {
      return a.index - b.index
    }
  }).filter(player => player.index != props.myself_index)
})
</script>
<template>
  <div class="players-container">
    <pre>myself_index: {{myself_index}}</pre>
    <div
      v-for="(player, index) of sortedPlayers(dynamic_players)" 
      :key="`dynamic_player_${ player.index }`"
      class="player-position"
      :style="{
        '--rotation': `${ deg(index) }deg`,
        '--position': `${ position(deg(index)) }`
      }"
    >
      <Player
        :deck="deck"
        :value="player"
        :playerIndex="player.index"
        :is_myself="player.index == myself_index"
        :is_turn="player.index == player_turn"
        :is_winner="player.index == winner"
        :playing="player.playing"
        :discard="discard"
        :state="state"
        :selected="selected"
        :rotation="`-${ deg(index) }deg`"
      />
    </div>  
  </div>
</template>
<style lang="sass">
.players-container
  position: absolute
  top: 0
  right: 0
  left: 0
  bottom: 30vh
  padding: 35vh 50%
  width: 0
  height: 0
  display: flex
  overflow: hidden
  .player-position
    width: 0px
    height: 0px
    border: none
    border-top: 4px solid red
    padding: 0
    position: absolute
    transform: translate(var(--position)) rotate(var(--rotation))
    transform-origin: 50% 50%
    .player
      position: absolute
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
    .name
      position: absolute
      margin-top: -52px
      margin-left: -22px
      text-align: center
      width: 100%
      transform: rotate(var(--rotation))
</style>