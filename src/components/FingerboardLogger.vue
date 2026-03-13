<script setup>
import {reactive} from 'vue'
import WheelPicker from './WheelPicker.vue'
const seconds = Array.from({length: 61}, (_, i) => i)

const emit = defineEmits(['save'])

// Standard grip types for fingerboarding
const gripTypes = [
  'Half Crimp', 'Open Hand', '3-Finger Drag',
  'Full Crimp', 'Pinch', 'Sloper', 'Pocket', 'Jug'
]

// Default to a standard "Max Hang" protocol baseline
const defaultState = () => ({
  grip: 'Half Crimp',
  sets: 3,
  reps: 1, // 1 rep = max hang. >1 = repeaters
  hangTime: 10, // seconds
  restTime: 3, // seconds (relevant for repeaters)
  addedWeight: 0, // kg (can be negative for pulley assistance)
  notes: ''
})

const form = reactive(defaultState())

const saveTraining = () => {
  emit('save', {type: 'fingerboard', ...form, timestamp: new Date()})
  // We don't fully reset the form here because users often do multiple 
  // sets of the same protocol with just a grip or weight change!
}
</script>

<template>
  <div class="bg-gray-800 rounded-2xl p-4 shadow-xl space-y-6">

    <div>
      <label class="text-xs text-gray-400 font-bold tracking-wider uppercase mb-2 block">Grip Type</label>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="grip in gripTypes" :key="grip" @click="form.grip = grip"
          class="py-2 px-2 rounded-lg text-sm font-semibold transition-colors border"
          :class="form.grip === grip ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-gray-700 border-gray-600 text-gray-300'">
          {{ grip }}
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <label class="text-xs text-gray-400 font-bold tracking-wider uppercase block">Protocol</label>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-700 rounded-xl p-2 flex flex-col items-center justify-center">
          <span class="text-xs text-gray-400 font-semibold mb-1">Sets</span>
          <div class="flex items-center space-x-3">
            <button @click="form.sets = Math.max(1, form.sets - 1)"
              class="w-8 h-8 bg-gray-600 rounded-full font-bold active:bg-gray-500">-</button>
            <span class="text-lg font-bold w-6 text-center">{{ form.sets }}</span>
            <button @click="form.sets++"
              class="w-8 h-8 bg-gray-600 rounded-full font-bold active:bg-gray-500">+</button>
          </div>
        </div>

        <div class="bg-gray-700 rounded-xl p-2 flex flex-col items-center justify-center">
          <span class="text-xs text-gray-400 font-semibold mb-1">Reps / Set</span>
          <div class="flex items-center space-x-3">
            <button @click="form.reps = Math.max(1, form.reps - 1)"
              class="w-8 h-8 bg-gray-600 rounded-full font-bold active:bg-gray-500">-</button>
            <span class="text-lg font-bold w-6 text-center">{{ form.reps }}</span>
            <button @click="form.reps++"
              class="w-8 h-8 bg-gray-600 rounded-full font-bold active:bg-gray-500">+</button>
          </div>
        </div>
      </div>

      <div class="bg-gray-700 rounded-xl p-3 flex justify-between items-center">
        <span class="text-sm text-gray-300 font-semibold">Added Weight (kg)</span>
        <div class="flex items-center space-x-4">
          <button @click="form.addedWeight -= 2.5"
            class="w-10 h-10 bg-gray-600 rounded-full font-bold text-lg active:bg-gray-500">-</button>
          <span class="text-xl font-bold w-10 text-center text-indigo-400">{{ form.addedWeight > 0 ? '+' : '' }}{{
            form.addedWeight }}</span>
          <button @click="form.addedWeight += 2.5"
            class="w-10 h-10 bg-gray-600 rounded-full font-bold text-lg active:bg-gray-500">+</button>
        </div>
      </div>
    </div>

    <div>
      <label class="label-style">Hang Time</label>
      <WheelPicker :items="seconds" v-model="form.hangTime" unit="sec" />
    </div>

    <div :class="{'opacity-30': form.reps <= 1}">
      <label class="label-style">Rest Time (between reps)</label>
      <WheelPicker :items="seconds" v-model="form.restTime" unit="sec" />
    </div>

    <button @click="saveTraining"
      class="w-full bg-indigo-600 active:bg-indigo-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg mt-4 transition-transform transform active:scale-95">
      LOG HANG
    </button>

  </div>
</template>
