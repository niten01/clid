<script setup>
import {reactive} from 'vue'
import WheelPicker from './WheelPicker.vue'

const emit = defineEmits(['save'])

const fontGrades = ['5', '6A', '6B', '6C', '7A', '7B', '7B+', '7C', '7C+', '8A']

const results = ['Flash', 'Top', 'Repetition', 'Project']

const tagsList = [
  {label: 'Sloper', path: 'icons/sloper.svg'},
  {label: 'Crimp', path: 'icons/crimp.svg'},
  {label: 'Dynamic', path: 'icons/dyno.svg'},
  {label: 'Pinch', path: 'icons/pinch.svg'},
  {label: 'Technical', path: 'icons/technical.svg'},
  {label: 'Athletic', path: 'icons/athletic.svg'},
]

const inclinesList = [
  {label: 'Slab', path: 'icons/slab.svg'},
  {label: 'Vertical', path: 'icons/vertical.svg'},
  {label: 'Slight overhang', path: 'icons/overhang-small.svg'},
  {label: 'Strong overhang', path: 'icons/overhang-big.svg'},
  {label: 'Roof', path: 'icons/roof.svg'},
  {label: 'Corner', path: 'icons/corner.svg'},
  {label: 'Arete', path: 'icons/arete.svg'},
]

const form = reactive({
  grade: '6A',
  result: 'Top',
  attempts: 2,
  tags: [],
  incline: [],
  rating: 5,
  difficulty: 5,
  notes: ''
})

const toggleSelection = (arr, item) => {
  const index = arr.indexOf(item)
  if (index === -1) arr.push(item)
  else arr.splice(index, 1)
}

const save = () => {
  emit('save', {...form})
  form.notes = '' // Clear notes for next ascent
}
</script>

<template>
  <div class="space-y-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl pb-10">

    <div>
      <label class="label-style">Font Grade</label>
      <WheelPicker :items="fontGrades" v-model="form.grade" />
    </div>

    <div>
      <label class="text-xs text-gray-400 font-bold tracking-wider uppercase mb-2 block">Result</label>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="res in results" :key="res" @click="form.result = res"
          class="py-3 rounded-lg font-semibold transition-colors"
          :class="form.result === res ? 'bg-green-500/20 border-2 border-green-500 text-white' : 'bg-slate-800 text-slate-300'">
          {{ res }}
        </button>
      </div>

      <div v-if="['Top', 'Repetition', 'Project'].includes(form.result)"
        class="mt-4 flex items-center justify-between bg-slate-800 rounded-lg p-2">
        <span class="pl-2 font-semibold text-gray-300">
          {{ form.result === 'Repetition' ? 'Reps' : 'Attempts' }}
        </span>
        <div class="flex items-center space-x-4">
          <button @click="form.attempts = Math.max(2, form.attempts - 1)"
            class="w-10 h-10 bg-slate-700 rounded-full text-xl font-bold">-</button>
          <span class="text-xl font-bold w-6 text-center">{{ form.attempts }}</span>
          <button @click="form.attempts++" class="w-10 h-10 bg-slate-700 rounded-full text-xl font-bold">+</button>
        </div>
      </div>
    </div>

    <div>
      <label class="label-style">Wall Angle</label>
      <div class="grid grid-cols-4 gap-3">
        <button v-for="inc in inclinesList" :key="inc.label" @click="toggleSelection(form.incline, inc.label)"
          class="flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-90"
          :class="form.incline.includes(inc.label) ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-800 border-transparent text-slate-500'">

          <div class="icon-mask w-10 h-10 mb-2" :style="{
            maskImage: `url(${inc.path})`,
            webkitMaskImage: `url(${inc.path})`
          }"></div>
          <span class="text-[10px] font-bold uppercase tracking-tighter">{{ inc.label }}</span>
        </button>
      </div>
    </div>

    <div>
      <label class="label-style">Characteristics</label>
      <div class="grid grid-cols-3 gap-3">
        <button v-for="tag in tagsList" :key="tag.label" @click="toggleSelection(form.tags, tag.label)"
          class="flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-90"
          :class="form.tags.includes(tag.label) ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-800 border-transparent text-slate-500'">
          <div class="icon-mask w-10 h-10 mb-2" :style="{
            maskImage: `url(${tag.path})`,
            webkitMaskImage: `url(${tag.path})`
          }"></div>
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ tag.label }}</span>
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <div class="flex justify-between mb-1">
          <label class="text-xs text-gray-400 font-bold tracking-wider uppercase block">Star Rating</label>
          <span class="text-yellow-400 font-bold">{{ form.rating }} / 10</span>
        </div>
        <input type="range" min="1" max="10" v-model="form.rating"
          class="w-full accent-yellow-400 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
      </div>

      <div>
        <div class="flex justify-between mb-1">
          <label class="text-xs text-gray-400 font-bold tracking-wider uppercase block">Perceived Difficulty</label>
          <span class="text-red-400 font-bold">{{ form.difficulty }} / 10</span>
        </div>
        <input type="range" min="1" max="10" v-model="form.difficulty"
          class="w-full accent-red-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
      </div>
    </div>

    <div>
      <label class="label-style">Personal Notes</label>
      <textarea v-model="form.notes" placeholder="Beta notes, beta breaks, or how it felt..."
        class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-600 resize-none"
        rows="3"></textarea>
    </div>

    <button @click="save"
      class="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform">
      SAVE ASCENT
    </button>
  </div>
</template>

<style scoped>
.label-style {
  @apply text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3 block;
}
</style>
