<script setup>

const players = ref([ ])
const turn = ref(0)
const i = ref(0)
function rng(){
  i.value++
  const a = i.value.toString()
  return a
}
const deg = (index => {
  const length = players.value.length-1
  let max = 45
  if(length >= 2){
    max = 90
  }
  if(length >= 4){
    max = 110
  }
  if(length >= 6){
    max = 130
  }
  if(length==0){
    return 180
  }
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
  const x = Math.cos(deg) * 35
  const y = Math.sin(deg) * 50

  return `${y}vw, ${x}vh`
})

function addPlayer(){
  const index = players.value.length
  players.value.push({ 
    name: rng(),
  })
}


function getAngle(deg){
  return 'transform: translateX()'
}
</script>

<template>
  <div>
    <div class="play-zone">
      <div 
        class="player-position"
        v-for="(player, index) of players"
        :key="index"
        :style="{
          '--rotation': `${deg(index)}deg`,
          '--position': `${position(deg(index))}`
        }"
      
      >
        <div class="player">
          <pre>{{player}}</pre>
        </div>
        <span class="name" :style="{'--rotation': `${deg(index) * -1}deg`}">{{player.name}}</span>
      </div>
    </div>
    <div class="myself">
      <span class="name">myself</span>
      <div>
        <button @click="addPlayer()">+</button>  
        <button @click="players.pop()">-</button>  
      </div>
    </div>
  </div>
</template>

<style lang="sass">
// .play-zone
//   position: absolute
//   top: 0
//   right: 0
//   left: 0
//   bottom: 30vh
//   padding: calc(35vh) calc(50vw)
//   background: #0002
//   display: flex
//   overflow: hidden

//   .player-position
//     width: 0px
//     height: 0px
//     border: none
//     border-top: 4px solid red
//     padding: 0
//     position: absolute
//     transform: translate(var(--position)) rotate(var(--rotation))
//     transform-origin: 50% 50%
//     .player
//       position: absolute
//       top: 50%
//       left: 50%
//       transform: translate(-50%, -50%)
//     .name
//       position: absolute
//       margin-top: -52px
//       margin-left: -22px
//       text-align: center
//       width: 100%
//       transform: rotate(var(--rotation))

// .myself
//   position: absolute
//   bottom: 0
//   width: 100%
//   height: 30vh
//   background: #0f02
//   margin: 0
//   right: 0
//   left: 0
//   .name
//     width: 100%
//     text-align: center
//     display: block
</style>