<script setup>
import {boulderColorStyles} from '../utils'
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const selectColor = (colorName) => {
  emit('update:modelValue', colorName === 'unset' ? null : colorName)
}
</script>

<template>
  <div class="grid grid-cols-5 gap-3">
    <button
      v-for="color in boulderColorStyles"
      :key="color.name"
      @click="selectColor(color.name)"
      class="aspect-square rounded-full border-4 transition-all active:scale-90 flex items-center justify-center relative"
      :class="[
        color.class,
        (modelValue === color.name || (!modelValue && color.name === 'unset')) 
          ? 'border-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
          : 'border-transparent opacity-60'
      ]"
    >
      <span v-if="color.icon" class="text-slate-400 font-bold">{{ color.icon }}</span>
      
      <div 
        v-if="modelValue === color.name || (!modelValue && color.name === 'unset')"
        class="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900"
      >
        ✓
      </div>
    </button>
  </div>
</template>
