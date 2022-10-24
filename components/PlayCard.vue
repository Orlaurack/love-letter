<script setup>
const props = defineProps({
  is: String,
  code: String,
  players: Array,
  pile: Array,
  myself: Object,
  myself_index: Number,
  deck: Object,
  discard: Array,
})

const emit = defineEmits([
  'draw',
  'next',
  'loose',
  'discard',
  'redraw'
])


</script>

<template>
  <div>
    <CardSpy
      v-if="is == 'Spy'"
      :code="code"
      :myself_index="myself_index"
      @next="emit('next', $event)"
    />
    <CardGuard
      v-if="is == 'Guard'"
      :code="code"
      :players="players"
      :myself="myself"
      :myself_index="myself_index"
      :deck="deck"
      @next="emit('next', $event)"
      @loose="emit('loose', $event)"
    />
    <CardPriest
      v-else-if="is == 'Priest'"
      :code="code"
      :players="players"
      :myself_index="myself_index"
      :deck="deck"
      @next="emit('next', $event)"
    />
    <CardBaron
      v-else-if="is == 'Baron'"
      :code="code"
      :players="players"
      :myself="myself"
      :myself_index="myself_index"
      :discard="discard"
      :deck="deck"
      @next="emit('next', $event)"
      @loose="emit('loose', $event)"
    />
    <CardHandmaid
      v-else-if="is == 'Handmaid'"
      :code="code"
      :myself_index="myself_index"
      @next="emit('next', $event)"
    />
    <CardPrince
      v-else-if="is == 'Prince'"
      :code="code"
      :players="players"
      :discard="discard"
      :deck="deck"
      :pile="pile"
      @next="emit('next', $event)"
      @redraw="emit('redraw', $event)"
      @loose="emit('loose', $event)"
    />
    <CardChancellor
      v-else-if="is == 'Chancellor'"
      :code="code"
      :myself="myself"
      :myself_index="myself_index"
      :deck="deck"
      :pile="pile"
      @next="emit('next', $event)"
      @draw="emit('draw', $event)"
    />
    <CardKing
      v-else-if="is == 'King'"
      :code="code"
      :players="players"
      :myself="myself"
      :myself_index="myself_index"
      @next="emit('next', $event)"
    />
    <CardCountess
      v-else-if="is == 'Countess'"
      @next="emit('next', $event)"
    />
    <CardPrincess
      v-else-if="is == 'Princess'"
      :code="code"
      :myself="myself"
      :myself_index="myself_index"
      @loose="emit('loose', $event)"
    />
    <div v-else>
      nothing ? {{ is }}
    </div>
  </div>
</template>