<script setup>
import { set, get, ref as firestoreRef } from "firebase/database"
const props = defineProps({
  code: String,
  players: Array,
  discard: Array,
  deck: Object,
  pile: Array
})
const emit = defineEmits(['next', 'redraw', 'loose'])
const rtdb = useRTDB()
const choosablePlayers = ref(props.players.filter((player) => !player.protected && !player.loose))

if(choosablePlayers.value.length == 0){
  emit('next')
}
if(choosablePlayers.value.length == 1){
  choosePlayer(choosablePlayers.value[0].index)
}

async function choosePlayer(playerIndex) {
  get(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + playerIndex + '/hand')).then(async (snapshot) => {
    const card = snapshot.val()[0]

    if(props.deck[card].name=='Princess')
    {
      emit('loose', playerIndex)
      emit('next')
    } 
    else 
    {
      emit('redraw', playerIndex)
      emit('next')
    }

  })
}

</script>
<template>
  <div>
    <h2>Prince</h2>
    choose player
    <PlayerSelect
      :players="choosablePlayers"
      @select="choosePlayer"
    />
    <!-- <div v-for="(player, index) of choosablePlayers" :key="index">
      <button 
        v-if="!player.protected && !player.loose"
        @click="choosePlayer(player.index)"
      >
        {{ player.name }}
      </button>
    </div> -->
  </div>
</template>
<style lang="sass">
  
</style>