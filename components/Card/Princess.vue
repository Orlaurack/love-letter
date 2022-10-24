<script setup>
const props = defineProps({
  code: Number, 
  myself: Object,
  myself_index: Number,
})

const emit = defineEmits(['loose', 'next'])
emit('loose')
emit('next')

</script>
<template>
  <div>
    <h2>Princesse</h2>
    loose
  </div>
</template>
<style lang="sass">
  
</style>