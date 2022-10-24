<script setup>
import { set, get, ref as firestoreRef } from "firebase/database"

const props = defineProps({
  code: String,
  deck: Object,
  players: Array,
  discard: Array,
  myself_index: Number,
  myself: Object,
})
const emit = defineEmits(['next', 'loose'])
const rtdb = useRTDB()
const myCard = ref(null)
const enemyCard = ref(null)
const choosablePlayers = ref(props.players.filter((player) => player.index !== props.myself_index && !player.protected && !player.loose))

if(choosablePlayers.value.length == 0){
  emit('next')
}
if(choosablePlayers.value.length == 1){
  choosePlayer(choosablePlayers.value[0].index)
}

async function choosePlayer(playerIndex) {
  get(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + playerIndex + '/hand/0')).then(async (snapshot) => {
    const playerCard = snapshot.val()
    if(props.myself.hand && playerCard){
      myCard.value = props.deck[props.myself.hand[0]]
      enemyCard.value = props.deck[playerCard]

      await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + props.myself_index + '/baron'), { playerIndex, selfCard: props.myself.hand[0], card: myCard.value.id })

      setTimeout(async () => {
        if(myCard.value.value > enemyCard.value.value){
          emit('loose', playerIndex)
        } else if (enemyCard.value.value > myCard.value.value) {
          emit('loose')
        } else {
          console.info("equality")
        }

        await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + props.myself_index + '/baron'), null)
        emit('next')
      }, 3000)      
    }
  })
}

onMounted(()=>{
  const choice = props.players.filter((player)=>player.index!=props.myself_index&&!player.protected)
  if(choice.length == 0){
    emit('next')
  }else if(choice.length == 1){
    choosePlayer(choice[0].index)
  }
})
</script>
<template>
  <div>
    <h2>Baron</h2>
    <div v-if="choosablePlayers.length > 1">
      choose player
      <PlayerSelect
        :players="choosablePlayers"
        @select="choosePlayer"
      />
    </div>
  </div>
</template>
<style lang="sass">
  
</style>