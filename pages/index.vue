<script setup>
import { signInAnonymously } from "firebase/auth"
import { set, ref as firestoreRef } from "firebase/database"
import { useRouter } from "vue-router"

const pseudo = ref('')
const code = ref('')
const router = useRouter()

function generateCode() {
  return Math.random().toString().substring(2, 6)
}

async function create() {
  if (pseudo.value != '') {
    localStorage.setItem('pseudo', pseudo.value)
    const auth = useAuth()
    const rtdb = useRTDB()

    const sign = await signInAnonymously(auth)
    code.value = generateCode()
    await set(firestoreRef(rtdb, 'rooms/room_' + code.value), {
      playerList: {
        [pseudo.value]: {
          host: true,
          ready: false
        }
      },
      state: 'pending players'
    })

    router.push(`/room/${code.value}-settings`)

  }
}
function join(code) {
  if (pseudo.value != '') {
    localStorage.setItem('pseudo', pseudo.value)
    router.push(`/room/${code}-settings`)
  }
}

onMounted(()=>{
  if(localStorage.getItem('pseudo')){
    pseudo.value = localStorage.getItem('pseudo')
  }
})
</script>
<template>
  <div class="container">
    <h1>Welcome to LL</h1>
    <div>
      <label>
        Pseudo
        <input type="text" v-model="pseudo">
      </label>
    </div>
    <div>
      Code
      <label>
        <input type="text" v-model="code">
      </label>
    </div>
    <div>
      <button v-if="code.length>0" @click="join(code)">Join</button>
      <button v-else @click="create">Create Room</button>
    </div>

  </div>
</template>
<style lang="sass">
.container
  display: flex
  flex-direction: column
  width: 100%
  gap: 20px
  div
    display: flex
    gap: 20px
</style>