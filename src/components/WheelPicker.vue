<script setup>
import {ref, onMounted, watch} from 'vue'

const props = defineProps(['items', 'modelValue', 'unit'])
const emit = defineEmits(['update:modelValue'])

const scrollContainer = ref(null)

const handleScroll = () => {
  if (!scrollContainer.value) return
  const itemWidth = 80 // Width of each item in px
  const scrollLeft = scrollContainer.value.scrollLeft
  const index = Math.round(scrollLeft / itemWidth)
  if (props.items[index] !== props.modelValue) {
    emit('update:modelValue', props.items[index])
  }
}

// Ensure the wheel starts at the current value
onMounted(() => {
  const index = props.items.indexOf(props.modelValue)
  if (index !== -1 && scrollContainer.value) {
    scrollContainer.value.scrollLeft = index * 80
  }
})
</script>

<template>
  <div
    class="relative w-full h-24 flex items-center justify-center bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700">
    <div class="absolute inset-0 pointer-events-none flex justify-center items-center">
      <div class="w-20 h-16 border-2 border-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
    </div>

    <div ref="scrollContainer" @scroll="handleScroll"
      class="flex items-center overflow-x-auto snap-x snap-mandatory scroll-smooth px-[calc(50%-40px)] hide-scrollbar overflow-hidden">
      <div v-for="item in items" :key="item"
        class="w-20 py-4 shrink-0 flex flex-col items-center justify-center snap-center transition-all duration-300"
        :class="modelValue === item ? 'scale-125 text-white font-black' : 'text-gray-500 scale-90'">
        <span class="text-2xl leading-none">{{ item }}</span>
        <span v-if="unit" class="text-[10px] uppercase font-bold opacity-60">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
