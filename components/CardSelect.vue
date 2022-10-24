<script setup>
const emit = defineEmits(['select'])

const props = defineProps({
  deck: Object,
  cards: Array,
})

const selectCard = (card) => {
  emit('select', card)
}

</script>
<template>
  <div class="modale">
    <div class="container">
      <div 
        class="item"
        v-for="card in cards"
        :key="card.code"
      >
        <Card 
          :card="card"
          hover_effect
          @click="selectCard(card.id)"
        />
      </div>
    </div>
  </div>
</template>
<style lang="sass">
.modale
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  width: 100%
  background: rgba(0,0,0,0.5) 
  overflow: auto
  z-index: 20000
  .container
    display: flex
    flex-direction: row
    flex-wrap: wrap
    gap: 20px
    width: calc(100% - 20vw)
    padding: 10vw
    
    .item
      margin: 0 auto
    
</style>