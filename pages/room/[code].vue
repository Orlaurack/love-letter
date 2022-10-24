<script setup>
import { useRoute } from 'vue-router';
import { set, update, remove, ref as firestoreRef, onValue, get, child } from "firebase/database"


const route = useRoute()
const rtdb = useRTDB()
const code = ref(route.params.code)

// const room = ref(null)
const myself = ref(null)
const myself_index = ref(null)
const deck = ref(null) 
const pile = ref(null)
const player_turn = ref(null)
const state = ref(null)

const discard = ref(null)
const players = ref(null)
const dynamic_players = ref(null)
const player_number = ref(0)
const selected_player = ref(null)
const selected_card = ref(null)

const winner = ref(null)
const victoryScore = ref(null)
// const messageTimout = ref(null)
// const messageDuration = ref(3000)

const pileEl = ref(null)
const discardEl = ref(null)
const myselfHandEl = ref(null)
const playersEl = ref(null)

const animation = ref(false)
const animatedCardEl = ref(null)
const animationDuration = ref(3000)

function getRef(path = '') {
  return firestoreRef(rtdb, 'rooms/room_' + code.value + path)
}

function getMyselfRef(path = '') {
  if(myself_index.value == null) return null
  return getPlayerRef(myself_index.value, path)
}

function getPlayerRef(index, path = '') {
  return firestoreRef(rtdb, 'rooms/room_' + code.value + '/players/' + index + path)
}

function listen() {
  const roomUri = 'rooms/room_' + code.value
  get(getRef()).then((snapshot) => {
    if(snapshot.exists()) {
      const room = snapshot.val()
      myself_index.value = room.players.findIndex((player) => player.name == localStorage.getItem('pseudo'))

      players.value = room.players.map((player, index) => {
        return {
          name: player.name,
          index: index,
          host: player.host,
        }
      })
      dynamic_players.value = room.players.map((player, index) => {
        return {
          index: index,
          name: player.name,
          host: player.host,
          protected: player.protected,
          spy: player.spy,
          loose: player.loose,
          playing: player.playing
        }
      })
      myself.value = room.players[myself_index.value]
      player_number.value = room.players.length
      deck.value = room.deck
      victoryScore.value = room.victory_score
      // messageDuration.value = room.message_duration
  
      if(!myself.value.ready){
        set(getMyselfRef('/ready'), true)
  
        room.players[myself_index.value].ready = true
        if(room.players.every((player) => player.ready)){
          set(getRef('/state'), 'starting')
        }
      }
  
      onValue(getRef('/players'), (snapshot) => {
        const players = snapshot.val()
        dynamic_players.value = players.map((player, index) => {
          return {
            index: index,
            name: player.name,
            host: player.host,
            loose: player.loose,
            playing: player.playing,
            protected: player.protected,
            spy: player.spy,
            baron: player.baron,
            score: player.score,
            // message: player.message
          }
        })
        myself.value = players[myself_index.value]
      })
      onValue(getRef('/selected_player'), (snapshot) => {
        selected_player.value = snapshot.val()
      })
      onValue(getRef('/selected_card'), (snapshot) => {
        selected_card.value = snapshot.val()
      })
      // onValue(getRef('/message_duration'), (snapshot) => {
      //   messageDuration.value = snapshot.val()
      // })
      onValue(getRef('/pile'), (snapshot) => {
        pile.value = snapshot.val()
      })
      onValue(getRef('/discard'), (snapshot) => {
        discard.value = snapshot.val()
      })
      onValue(getRef('/player_turn'), (snapshot) => {
        player_turn.value = snapshot.val()
      })
      onValue(getRef('/state'), async (snapshot) => {
        state.value = snapshot.val()
        switch(state.value){
          case 'wait_players':
            if(dynamic_players.value.every(player=>player.ready)){

            }
            break
          case 'starting':
            winner.value = null
            if(myself.value?.host){
              pile.value = await shuffleCards()
              await set(getRef('/pile'), pile.value)
              await set(getRef('/discard'), [])
              for (const player of dynamic_players.value) {
                
                await update(getRef(`/players/${ player.index }`), {
                  hand: [],
                  loose: false,
                })
    
                await drawCard(1, player.index)
              }
              await set(getRef('/state'), 'waiting')
            }
            
            break
          case 'waiting':
            setTimeout(() => {
              set(getRef('/state'), 'drawing')
            }, 1000);
            break
          case 'drawing':
            if (player_turn.value == myself_index.value){
              if(dynamic_players.value.filter(player=>!player.loose).length <= 1){
                await set(getRef('/state'), 'ending')
              } else if (pile.value.length <= 1){
                await set(getRef('/state'), 'ending')
              } else {
                if (myself.value?.loose) {      
                  nextTurn()
                } else {
                  
                  if(myself.value.protected){
                    await set(getMyselfRef('/protected'), false)
                  }
                  if(myself.value.spy){
                    await set(getMyselfRef('/spy'), false)
                    await set(getMyselfRef('/score'), myself.value.score+1)
                  }
                  await drawCard(2)
                  await set(getRef('/state'), 'waiting_play_card')
                }
              }
            }
            break
          case 'waiting_play_card':
    
            break
          case 'playing_card':
    
            break
          case 'ending':
            if(!winner.value){
              const player = dynamic_players.value.find((player) => !player.loose)
              winner.value = player.index
              !player.score ? 1 : player.score++
              await set(getPlayerRef(winner.value, '/score'), player.score)
            }
            break
          default:
            break   
        }
      })
    }
  })
}

async function distributeCards(){
  if(myself.value.host && state.value == 'starting'){
    await set(getRef('/state'), 'playing')

    for (let index = 0; index < players.value.length; index++) {
      const card = pile.value.pop()
      await set(getPlayerRef(index, '/hand'), [ card ])
    }
    await set(getRef('/pile'), pile.value)
  }
}
// async function messaging(message, playerIndex = myself_index.value){
//   await set(getPlayerRef(playerIndex, '/message'), message)
//   if(messageTimout.value) clearTimeout(messageTimout.value) 

//   messageTimout.value = setTimeout(() => {
//     set(getPlayerRef(playerIndex, '/message'), '')
//   }, messageDuration.value); 
// }

async function drawCard(max = 2, playerIndex = myself_index.value) {
  await get(getPlayerRef(playerIndex, '/hand')).then(async (snapshot) => {
    const hand = snapshot.val() ?? []

    
    let newPile = pile.value
    
    while (hand.length < max) {
      hand.push(newPile.pop())
      await animateCardDeplacement(pileEl.value, myselfHandEl.value, {frontSide: false}, {frontSide: true})
      await set(getPlayerRef(playerIndex, '/hand'), hand)
    }
    await set(getRef('/pile'), newPile)
  })

  return true
}

async function discardCard(playerIndex = myself_index.value) {
  get(getPlayerRef(playerIndex, '/hand/0')).then(async (snapshot) => {
    if(snapshot.exists()){
      const card = snapshot.val()
      if(discard.value == null){
        discard.value = []
      }
      discard.value.push(card)
      await set(getRef('/discard'), discard.value)
      await set(getPlayerRef(playerIndex, '/hand'), null)
      if(deck.value[card].name == 'Princess'){
        loosePlayer(playerIndex)
      }
    }
  })
}
async function redrawCard(playerIndex = myself_index.value) {
  await discardCard(playerIndex)
  await drawCard(1, playerIndex)
}

async function nextTurn() {
  if(await checkEnded()){
    return
  }

  player_turn.value = (player_turn.value+1) % players.value.length
  if(myself.value.playing){
    if(discard.value){
      discard.value.push(myself.value.playing)
    } else {
      discard.value = [myself.value.playing]
    }
    myself.value.playing = null
  }

  await set(getRef('/discard'), discard.value)
  await set(getMyselfRef('/playing'), null)
  await set(getRef('/player_turn'), player_turn.value)
  await set(getRef('/state'), 'drawing')
}

async function playCard(card_index){

  if(myself.value.hand.some(card=>deck.value[card].name == 'Countess')) {
    if(myself.value.hand.some(card=>deck.value[card].countess_forced)) {
      card_index = myself.value.hand.findIndex(card_id=>deck.value[card_id].name == 'Countess')
    }
  }

  if (myself_index.value == player_turn.value && state.value == "waiting_play_card"){
    
    await animateCardDeplacement(myselfHandEl.value.children[card_index], discardEl.value, {frontSide: true}, {frontSide: true})
    setTimeout(() => {
      const hand = myself.value.hand
      const card = hand.splice(card_index, 1)
      
      console.log(hand, card)
      set(getRef('/state'), 'playing_card')
      set(getMyselfRef('/hand'), hand)
      set(getMyselfRef('/playing'), card[0])
    }, animationDuration.value);
  }
  
  if(myself_index.value == player_turn.value && state.value == "playing_card" && myself.value.playing && deck.value[myself.value.playing].name == 'Chancellor'){
    console.log('ah okey je vois')
    replaceInPile(card_index)
  }
}

async function replaceInPile(card_index){
  const card = myself.value.hand.splice(card_index, 1)
  console.log(pile.value)
  if(pile.value){
    pile.value.unshift(card[0])
  }else{
    pile.value = [card[0]]
  }

  await set(getMyselfRef('/hand'), myself.value.hand)
  await set(getRef('/pile'), pile.value)

  if(myself.value.hand && myself.value.hand.length == 1){
    nextTurn()
  }
}

async function loosePlayer(playerIndex = myself_index.value){
  get(getPlayerRef(playerIndex)).then(async (snapshot) => {
    const player = snapshot.val()
    if(discard.value){
      discard.value.push(player.hand[0])
    }else{
      discard.value = [player.hand[0]]
    }
    player.hand = []
    player.loose = true

    await set(getRef('/discard'), discard.value)
    await set(getPlayerRef(playerIndex, '/hand'), [])
    await set(getPlayerRef(playerIndex, '/loose'), true)

    checkEnded()
  })
}

async function checkEnded(){
  if(dynamic_players.value.filter(player => !player.loose).length <= 1){
    console.info('il ne reste qu\'un joueur')
    console.info('Nous avons un gagnant')
    await set(getRef('/state'), 'ending')
    return true
  }
  return false  
}

async function shuffleCards(){
  let newPile = []
  for(const card of deck.value){
    newPile = [
      ...Array(card.quantity).fill(card.id),
      ...newPile
    ]
  }
  for (var i = newPile.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = newPile[i];
    newPile[i] = newPile[j];
    newPile[j] = temp;
  }
  return newPile
}

function nextWave(){
  set(getRef('/state'), 'starting')
}

// watch(messageDuration, (value) => {
//   set(getRef('/message_duration'), value)
// })

onMounted(()=>{
  listen()
})

function resetGame(){
  set(getRef('/state'), 'starting')
}

async function animateCardDeplacement(sourceEl, destinationEl, sourceState, destinationState){ 
  console.log(sourceEl, destinationEl)
  if(sourceEl && destinationEl){
    const animatedEl = animatedCardEl.value
    console.log('animation start')

    const source = sourceEl.getBoundingClientRect()
    const destination = destinationEl.getBoundingClientRect()

    const rotateY = sourceState.frontSide != destinationState.frontSide
    
    animation.value = true
    console.log(animatedEl)
    animatedEl.style.transform = `rotateY(0deg)`
    const transitionMem = sourceEl.style.transition
    
    
    animatedEl.style.zIndex = `30`
    animatedEl.style.position = `absolute`
    animatedEl.style.left = `${source.left}px`
    animatedEl.style.top = `${source.top}px`
    
    console.log(sourceEl.style.left, sourceEl.style.top)
    
    setTimeout(() => {
      animatedEl.style.transition = `all ${animationDuration.value}ms ease-out`
      animatedEl.style.left = `${destination.left}px`
      animatedEl.style.top = `${destination.top}px`
      if(rotateY){
        animatedEl.style.transform = `rotateY(180deg)`
      }
    }, 10)
    
    setTimeout(() => {
      animation.value = false
      console.log('animation end 1')
    }, animationDuration.value);
    return true
  }
  return false
}
</script>
<template>
  <div v-if="myself && deck">
    <Card
      ref="animatedCardEl"
      class="animatedCard"
    />
      <!-- v-if="animation" -->
    <div class="players">
      <PlayersContainer
        :dynamic_players="dynamic_players"
        :deck="deck"
        :discard="discard"
        :state="state"
        :myself_index="myself_index"
        :myself="myself"
        :selected="selected_player"
        :player_turn="player_turn"
        :winner="winner"
      >
      </PlayersContainer>
    </div>
    <div class="table">
      <div class="cards discard" ref="discardEl" v-if="discard">
        <Card 
          v-for="(card, index) of discard"
          :key="index"
          class="card"
          :card="deck[card]"
          :style="{'z-index': index}"
        /> 
        <Card 
          v-if="myself && myself.playing != null && state == 'playing_card'"
          class="card"
          :card="deck[myself.playing]"
          :style="{'z-index': discard.length}"
        />
      </div>
      <div class="cards pile" ref="pileEl">
        <Card
          v-for="(card, index) of pile"
          :key="index"
          class="card"
        />
      </div>

      <div v-if="winner !== null">
        <pre>
          {{players[winner].name}} à remporté la manche 
          Voulez-vous continer ?
        </pre>
        <button @click="nextWave()">Nouvelle manche</button>
        <button @click="endGame()">Arréter</button>
      </div>

    </div>
    <div class="myself">
      <h2>Room {{ code }} <span class="state">{{ state }}</span></h2>

      <div v-if="myself.host">
        <button @click="resetGame">RESET</button>
      </div>
      <Player
        :deck="deck"
        :value="myself"
        :playerIndex="myself_index"
        :is_myself="true"
        :is_turn="myself_index == player_turn"
        :is_winner="myself_index == winner"
        :discard="discard"
        :state="state"
        :selected="selected_player"
      />

      <div v-if="myself && myself.playing != null && state == 'playing_card'">

        <h3>Playing</h3>

        <PlayCard 
          :is='deck[myself.playing].name'
          :code="code"
          :players="dynamic_players"
          :pile="pile"
          :myself="myself"
          :myself_index="myself_index"
          :deck="deck"
          :discard="discard"

          @draw="drawCard"
          @next="nextTurn"
          @loose="loosePlayer" 
          @discard="discardCard"
          @redraw="redrawCard"
        />
        <!-- :message_duration="messageDuration" -->
        <!-- @message="messaging" -->
      </div>
      
      <div class="hand" v-if="myself" ref="myselfHandEl" v-show="myself.hand">
        <Card 
          v-for="(card, index) of myself.hand"
          :key="index"
          :index="index"
          :cards_length="myself.hand.length"
          @click="playCard(index)"
          hover_effect
          :playable="myself_index == player_turn"
          :card="deck[card]"
        />
      </div>
    </div>
      
      <!-- <div v-if="myself.playing">
        <h3>Playing</h3>
        <Card
          hover_effect
          :card="deck[myself.playing]"
        />
      </div> -->

      <!-- <div v-if="dynamic_players && dynamic_players[player_turn]">
        <h3>Infos</h3>
        
        <div v-if="dynamic_players[player_turn].baron && (dynamic_players[player_turn].baron.playerIndex == myself_index)">
          Ma carte
          <Card 
            :card="deck[dynamic_players[player_turn].baron.card]"
          />

          Sa carte
          <Card 
            :card="deck[dynamic_players[player_turn].baron.selfCard]"
          />
        </div>
      </div> -->


  </div>
</template>
<style lang="sass" scoped>
.host::after
  content: '(admin)'
  font-size: 10px
  position: absolute
  line-height: 1rem
  margin-left: 5px
.animatedCard
  z-index: 30
  position: absolute
.players
  position: absolute
  width: 100%
  height: 70vh
  top: 0
  right: 0
  left: 0
.table
  position: absolute
  width: calc(100% - 20vw)
  height: calc(70vh - 15vw)
  top: 0
  right: 0
  left: 0
  gap-y: 0
  display: flex
  align-items: flex-start
  justify-content: center
  flex-wrap: wrap
  padding: 10vw
  padding-top: 25vh
  padding-bottom: 5vw
  .discard, .pile
    height: 180px
    padding-right: 100px
    margin: 10px
    .card
      transition: 200ms
      margin-right: -107px
      &:nth-child(2n+1)
        transform: rotate(2deg)
      &:nth-child(3n+2)
        transform: rotate(-2deg)
      &:nth-child(5n+1)
        transform: rotate(4deg)
      &:nth-child(7n+2)
        transform: rotate(-4deg)
  .discard:hover .card
      margin-right: -86px
      transform: rotate(0)


.myself
  position: absolute
  bottom: 0
  width: 100%
  height: 30vh
  margin: 0
  right: 0
  left: 0
  .name
    width: 100%
    text-align: center
    display: block
  .player
    margin: 0 auto
  
.cards
  display: flex
  flex-direction: row 
  gap: 5px
  .card
    border: 1px solid #00000022
    display: flex
    align-items: center
    justify-content: center
    &.playable
      cursor: pointer
.state
  color: gray
.hand
  position: absolute
  padding: 40px
  transform: translateY(60px)
  transition: 500ms
  display: flex
  flex-direction: row
  gap: 20px
  justify-content: center
  bottom: 0
  left: 0
  right: 0
  &:hover
    transform: translateY(0px)
</style>