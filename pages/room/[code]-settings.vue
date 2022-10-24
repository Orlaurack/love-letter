<script setup>
import { set, remove,  ref as firestoreRef, onValue, off } from "firebase/database"

const route = useRoute()
const router = useRouter()
const rtdb = useRTDB()
const room = ref(null)
const pseudo = ref(null)
const code = ref(route.params.code)
const host = ref(false)
// const messageDuration = ref(2000)


// 0 (2)– L’assassin : Si un joueur utilise un garde sur vous, ce joueur est éliminé et vous piocher une nouvelle carte.
// 1 – Le fou : Permet de placer un jeton devant un autre joueur, si ce dernier gagne la manche, vous gagnez aussi un point de victoire.
// 2 – Le cardinal : Permet de permuter les cartes de deux joueurs encore en jeu. Puis regarde une des deux cartes permutées.
// 3 – La Baronne : Permet de regarder la carte d’un ou deux joueurs
// 4 – Les courtisans : Permet de placer un marqueur sur un joueur. Aussi longtemps que les cartes jouées impliquent des joueurs, le joueur marqué devra être ciblé.
// 5 – Les comtes : à la fin de la partie, le compte permet d’ajouter 1 à la valeur de la carte encore en main.
// 6 – Le connétable : si vous êtes tués pendant la manche en ayant le constable dans votre défausse, vous gagnez un point de victoire.
// 7 – La reine mère : Permet de comparer secrètement sa carte avec un autre joueur, le joueur avec la carte la plus faible remporte le duel.
// 10 – L’évêque : Permet de noter la carte d’un autre joueur. S’il tombe juste, il gagne un point de victoire. L’autre joueur peut décider de se défausser de sa carte ou pas.

// 2 (2)- L'escroc : Ciblez deux joueurs qui doivent s'échanger leur carte.
// 3 (1)– La baronne : comparer secrètement votre carte avec celle d'un autre joueur, celui qui possède la plus forte valeur est éliminé.
// 4 (1)- L'intendant : en plus d'être protégé comme la servante, si vous gagnez la manche avec l'intendant, cela revient à en gagner 2.

// 5 (2)- La voyante : vous pouvez regarder la carte écartée en début de partie et l'échanger avec votre carte si vous le shoutez.
// 1 (2)- Le faussaire : appliquez le même pouvoir que le dernier personnage joué par un joueur encore dans de la partie. 

const deck = ref([
  {
    id: 0,
    value: 0,
    title: 'espionne',
    name: 'Spy',
    guard_protection: false,
    countess_forced: false,
    description: 'A la fin de la manche, si vous êtes le seul joueur encore en lice qui a joué ou défaussé une Espionne, vous gagnez 1 pion de Faveur.', 
    quantity: 2,
  },
  {
    id: 1,
    value: 1,
    title: 'garde',
    name: 'Guard',
    guard_protection: true,
    countess_forced: false,
    description: 'Choisissez un joueur et essayez de deviner la carte qu’il a en main (excepté le Garde), si vous tombez juste, le joueur est éliminé de la manche.', 
    quantity: 6,
  },
  {
    id: 2,
    value: 2,
    title: 'prêtre',
    name: 'Priest',
    guard_protection: false,
    countess_forced: false,
    description: 'Regardez la main d’un autre joueur.', 
    quantity: 2,
  },
  {
    id: 3,
    value: 3,
    title: 'baron',    
    name: 'Baron',
    guard_protection: false,
    countess_forced: false,
    description: 'Vous et un autre joueur comparez secrètement vos mains. Le joueur qui a la carte avec la plus faible valeur est éliminé de la manche.', 
    quantity: 2,
  },
  {
    id: 4,
    value: 4,
    title: 'servante',    
    name: 'Handmaid',
    guard_protection: false,
    countess_forced: false,
    description: 'Jusqu’au prochain tour, vous êtes protégé des effets des cartes des autres joueurs.', 
    quantity: 2,
  },
  {
    id: 5,
    value: 5,
    title: 'prince',    
    name: 'Prince',
    guard_protection: false,
    countess_forced: true,
    description: 'Choisissez un joueur (y compris vous), celui-ci défausse la carte qu’il a en main pour en piocher une nouvelle.', 
    quantity: 2,
  },
  {
    id: 6,
    value: 6,
    title: 'chancelier',    
    name: 'Chancellor',
    guard_protection: false,
    countess_forced: false,
    description: 'Piochez 2 cartes du paquet et ajoutez-les à votre main. Choisissez et conservez une des trois cartes de votre main, puis placez les deux autres, faces cachées au dessous du paquet (dans l’ordre de votre choix).', 
    quantity: 2,
  },
  {
    id: 7,
    value: 7,
    title: 'roi',    
    name: 'King',
    guard_protection: false,
    countess_forced: true,
    description: 'Échangez votre main avec un autre joueur de votre choix.', 
    quantity: 1,
  },
  {
    id: 8,
    value: 8,
    title: 'comptesse',    
    name: 'Countess',
    guard_protection: false,
    countess_forced: false,
    description: 'Si vous avez cette carte en main en même temps que le King ou le Prince, alors vous devez défausser la carte de la Comtesse.', 
    quantity: 1,
  },
  {
    id: 9,
    value: 9,
    title: 'princesse',    
    name: 'Princess',
    guard_protection: false,
    countess_forced: false,
    description: 'Si vous défaussez cette carte, vous êtes éliminé de la manche.', 
    quantity: 1,
  },
])
const victoryScore = ref(5)
const isReady = ref(false)
const allIsReady = ref(false)

async function listen() {
  onValue(firestoreRef(rtdb, 'rooms/room_' + route.params.code), (snapshot) => {
    room.value = snapshot.val()
    if (room.value && room.value.playerList){
      if (!room.value.playerList[pseudo.value]) {
        set(firestoreRef(rtdb, 'rooms/room_' + code.value + '/playerList/' + pseudo.value), {
          host: false,
          is_ready: false
        })
        host.value = false
      }else{
        host.value = room.value.playerList[pseudo.value].host
      }
      allIsReady.value = true
      for (const [name, player] of Object.entries(room.value.playerList)) {
        if (!player.is_ready) allIsReady.value = false
        if (name == pseudo.value) isReady.value = player.is_ready
      }
    }
    if(room.value.state == 'wait_players'){
      router.push('/room/' + code.value)
    }
  });
}

async function setReady() {
  await set(firestoreRef(rtdb, 'rooms/room_' + code.value + '/playerList/' + pseudo.value + '/is_ready'), true)
}

async function start(){
  const players = []
  for (const [name, player] of Object.entries(room.value.playerList)) {
    players.push({
      name,
      hand: [],
      discard: [],
      host: player.host,
      score: 0,
    })
  }

  off(firestoreRef(rtdb, 'rooms/room_' + route.params.code))

  await remove(firestoreRef(rtdb, `rooms/room_${code.value}/playerList`))

  await set(firestoreRef(rtdb, 'rooms/room_' + code.value),{
    state: 'wait_players',
    deck: deck.value,
    victory_score: victoryScore.value,
    // message_duration: messageDuration.value,
    pile: [],
    discard: [],
    players: players,
    player_turn: 0,

  })
  
  setTimeout(() => {
    router.push('/room/' + code.value)
  }, 200);
}



onMounted(()=>{
  pseudo.value = localStorage.getItem('pseudo')

  listen()
})
</script>
<template>
  <div>
    <h1>Code : {{code}}</h1>
    <div class="deck-settings">
      <Card
        v-for="(card, index) of deck"
        :card="card"
        :key="index"
      >
        <div>
          <span>Quantité:</span>
          <button v-if="host" @click="card.quantity>0?card.quantity--:null">-</button>
          <span>{{card.quantity}}</span>
          <button v-if="host" @click="card.quantity++">+</button>
        </div>
        <div>
          <span>Valeur:</span>
          <button v-if="host" @click="card.value--">-</button>
          <span>{{card.value}}</span>
          <button v-if="host" @click="card.value++">+</button>
        </div>
      </Card>


    </div>
    <div>
      points de victoires necessaire pour gagner: 
      <button v-if="host" @click="victoryScore--">-</button>
      {{victoryScore}}
      <button v-if="host" @click="victoryScore++">+</button>
    </div>

    
    <div>
      <!-- durrée des messages : 
      <button v-if="host" @click="messageDuration-=1000">-</button>
      {{messageDuration/1000}}
      <button v-if="host" @click="messageDuration+=1000">+</button>
      secondes -->
    </div>
    <div class="players" v-if="room">
      <Player 
        v-for="(player, name, index) of room.playerList"
        :key="`player_${index}`"
        :class="{isready: player.is_ready}"
        :value="{...player, name}"
        :is_myself="pseudo == name"
        :is_ready="player.is_ready"
        simplified
      >
      </Player>
      
    </div>
    <button v-if="!isReady" @click="setReady">Ready</button>
    <button v-if="allIsReady && host" @click="start">Start game</button>
  </div>
</template>
<style lang="sass">
.players .player.is_ready
  color: green
.deck-settings
  display: flex
  flex-direction: row
  gap: 20px
  overflow-x: auto
  text-align: center
  span
    font-size: 13px
  button 
    border: none
    background: none
</style>