<script setup>
import { get, ref as firestoreRef } from "firebase/database"
const emit = defineEmits(['next'])
const props = defineProps({
  code: String,
  players: Array,
  deck: Object,
  myself_index: Number
})
const rtdb = useRTDB()
const card = ref(null)
const player_index = ref(null)

const choosablePlayers = ref(props.players.filter((player) => player.index !== props.myself_index && !player.protected && !player.loose))

if(choosablePlayers.value.length == 0){
  emit('next')
}
if(choosablePlayers.value.length == 1){
  choosePlayer(choosablePlayers.value[0].index)
}

function choosePlayer(index) {
  player_index.value = index
  get(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + player_index.value + '/hand/0')).then(async (snapshot) => {
    card.value = snapshot.val()
    console.log(card.value)
  })
}

function next(){
  emit('next', {})
}
</script>
<template>
  <div>
    <h2>Priest</h2>
    <div v-if="card" class="modal-card">
      <Card  :card="deck[card]" @click="next" />
    </div>
    <div v-else>
      choose a player
      <PlayerSelect
        :players="choosablePlayers"
        @select="choosePlayer"
      />
    </div>

  </div>
</template>
<style lang="sass">
.modal-card
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  width: 100%
  background: rgba(0,0,0,0.5) 
  overflow: auto
  z-index: 20000
  display: flex
  justify-content: center
  align-items: center

</style>