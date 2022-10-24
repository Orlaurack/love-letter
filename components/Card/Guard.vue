<script setup>
import { get, set, ref as firestoreRef } from "firebase/database"

const props = defineProps({
  code: String,
  players: Array,
  myself_index: Number,
  myself: Object,
  deck: Object,
})

const rtdb = useRTDB()
const choosedPlayer = ref(null)
const choosedCard = ref(null)
const emit = defineEmits(['next', 'loose'])
const delay = ms => new Promise(res => setTimeout(res, ms))

const choosablePlayers = ref(props.players.filter((player) => player.index !== props.myself_index && !player.protected && !player.loose))
if(choosablePlayers.value.length == 0){
  emit('next')
}
if(choosablePlayers.value.length == 1){
  choosePlayer(choosablePlayers.value[0].index)
}

async function choosePlayer(playerIndex){
  choosedPlayer.value = playerIndex
  await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/selected_player'), playerIndex)
}

async function chooseCard(cardIndex){
  choosedCard.value = cardIndex
  await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/selected_card'), cardIndex)

  showUp()
}

async function showUp(){
  if (typeof choosedCard.value == 'number' && typeof choosedPlayer.value == 'number'){
    get(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + choosedPlayer.value + '/hand/0')).then(async (snapshot) => {
      const playerCard = snapshot.val()
      //emit('message', `${ props.myself.name } demande à ${ props.players[choosedPlayer.value].name } s'il/elle possède un/une ${ props.deck[choosedCard.value].title }`)
      setTimeout(async ()=>{
        if (playerCard == choosedCard.value){
          emit('loose', choosedPlayer.value)
        }

        await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/selected_player'), null)
        await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/selected_card'), null)
        emit('next', {})
      }, 1000)
    })
  }
}
</script>
<template>
  <div>
    <pre>
      {{choosedPlayer}}
      {{choosedCard}}
    </pre>
    <h2>Guard</h2>
    <div v-if="choosedPlayer==null">
      choose a player
      <PlayerSelect
        :players="choosablePlayers"
        @select="choosePlayer"
      />
    </div>
    <div v-if="choosedCard==null && choosedPlayer!=null">
      choose a card
      <CardSelect
        :cards="deck.filter(card=>!card.guard_protection)"
        :deck="deck"
        @select="chooseCard"
      />
    </div>
  </div>
</template>
<style lang="sass">
  
</style>