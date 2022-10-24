<script setup>
import { set, ref as firestoreRef } from "firebase/database"

const props = defineProps({
  code: String,
  deck: Object,
  pile: Array,
  myself_index: Number,
  myself: Object,
})
const emit = defineEmits(['next', 'draw'])

onMounted(()=>{
  emit('draw', 3)
})

watch(props.myself.hand, (val)=>{
  if(val.length == 1){
    emit('next')
  }
})
</script>
<template>
  <div>
    <h2>Chancellor</h2>
    Draw 2 cards
  </div>
</template>