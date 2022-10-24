<script setup>
import { set, ref as firestoreRef } from "firebase/database"

const props = defineProps({
  code: String,
  myself_index: Number
})

const emit = defineEmits(['next'])
const rtdb = useRTDB()

onMounted(async () => {
  await set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + props.myself_index + '/spy'), true)
  setTimeout(() => {
    emit('next')
  }, 1000);
})

</script>
<template>
  <div>
    <h2>spy</h2>
  </div>
</template>
<style lang="sass">
  
</style>