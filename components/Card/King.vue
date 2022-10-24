<script setup>
import { set, get, ref as firestoreRef } from "firebase/database"

const props = defineProps({
  code: String,
  players: Array,
  myself_index: Number,
  myself: Object
})
const emit = defineEmits(['next'])
const rtdb = useRTDB()
const choosablePlayers = ref(props.players.filter((player) => player.index !== props.myself_index && !player.protected && !player.loose))

if(choosablePlayers.value.length == 0){
  emit('next')
}
if(choosablePlayers.value.length == 1){
  changeWith(choosablePlayers.value[0].index)
}

async function changeWith(playerIndex){
  get(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + playerIndex + '/hand/0')).then(async (snapshot) => {
    const playerCard = snapshot.val()
    const myCard = props.myself.hand[0]

    await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + props.myself_index + '/hand/0'), playerCard)
    await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + playerIndex + '/hand/0'), myCard)
    emit('next', {})
  })
}
</script>

<template>
  <div>
    <h2>King</h2>
    <PlayerSelect
      :players="choosablePlayers"
      @select="changeWith"
    />
  </div>
</template>

<style lang="sass">  
</style>