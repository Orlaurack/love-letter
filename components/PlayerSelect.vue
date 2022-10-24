<script setup>
const emit = defineEmits(['select'])

const props = defineProps({
  players: Array
})

const selectPlayer = (player) => {
  emit('select', player)
}

</script>
<template>
  <div class="modale">
    <div class="container">
      <div 
        class="player"
        v-for="player in players"
        :key="player.code"
        @click="selectPlayer(player.index)"
      >
        {{ player.name }}
      </div>
    </div>
  </div>
</template>
<style lang="sass">
.modale
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  width: 100%
  background: rgba(0,0,0,0.5) 
  overflow: auto
  z-index: 20000
  .container
    display: flex
    flex-direction: row
    flex-wrap: wrap
    gap: 20px
    width: calc(100% - 20vw)
    padding: 10vw
    
    .player
      padding: 20px
      width: 200px
      height: 50px
      display: flex
      justify-content: center
      align-items: center
      border: black 2px solid 
      background-color: white
      transition: 200ms
      cursor: pointer
      &:hover
        transform: scale(1.1)
    
</style>