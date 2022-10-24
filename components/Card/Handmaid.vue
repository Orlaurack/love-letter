<script setup>
import { set, ref as firestoreRef } from "firebase/database"
const props = defineProps({
  code: String,
  myself_index: Number
})
const emit = defineEmits(['next'])
const rtdb = useRTDB()

onMounted(() => {
  set(firestoreRef(rtdb, 'rooms/room_' + props.code + '/players/' + props.myself_index + '/protected'), true).then(()=>{
    emit('next')
  })
})

</script>
<template>
  <div>
    <h2>Servante</h2>
    nothing
  </div>
</template>
<style lang="sass">
  
</style>