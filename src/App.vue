<script setup>
import {ref} from 'vue'
import AscentLogger from './components/AscentLogger.vue'
import FingerboardLogger from './components/FingerboardLogger.vue'
import {supabase} from './supabase'
import {useToast} from "vue-toastification";

const view = ref('home') // 'home', 'session', 'fingerboard'
const activeSession = ref(null)

const toast = useToast();

const startSession = () => {
  activeSession.value = {
    startTime: new Date(),
    name: `Session ${new Date().toLocaleDateString()}`,
    location: 'RockZona',
    ascents: []
  }
  view.value = 'session'
}

const saveFingerboardOnly = (data) => {
  console.log("Saving Standalone Fingerboard:", data)
  view.value = 'home' // Return home after quick log
}

const addAscent = (ascent) => {
  activeSession.value.ascents.push(ascent)
  toast.success("Ascent logged!")
}

const endSession = async () => {
  view.value = 'home'

  if (activeSession.value.ascents.length === 0) {
    toast.warning("Skipping empty session")
    return
  }

  const {data, error} = await supabase
    .from('sessions')
    .insert([{
      name: activeSession.value.name,
      location: activeSession.value.location,
      ascents: activeSession.value.ascents
    }])

  if (!error) {
    activeSession.value = null
    toast.success("Session saved!")
  }
}

</script>

<template>
  <div class="min-h-screen bg-gray-950 text-slate-100 p-4 font-sans">

    <div v-if="view === 'home'" class="max-w-md mx-auto h-[80vh] flex flex-col justify-center gap-6">
      <h1
        class="text-4xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        SEND TRACKER
      </h1>

      <button @click="startSession"
        class="group relative overflow-hidden bg-blue-600 p-8 rounded-3xl transition-all active:scale-95 shadow-xl">
        <div class="relative z-10 flex flex-col items-start">
          <span class="text-3xl">🧗</span>
          <span class="text-2xl font-bold mt-2">Start Session</span>
          <p class="text-blue-200 text-sm">Log multiple ascents & volume</p>
        </div>
        <div class="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">SESSION</div>
      </button>

      <button @click="view = 'fingerboard'"
        class="group relative overflow-hidden bg-slate-800 p-8 rounded-3xl transition-all active:scale-95 shadow-lg border border-slate-700">
        <div class="relative z-10 flex flex-col items-start">
          <span class="text-3xl">🦾</span>
          <span class="text-2xl font-bold mt-2">Fingerboard</span>
          <p class="text-slate-400 text-sm">Quick log a hang protocol</p>
        </div>
      </button>
    </div>

    <div v-if="view === 'session'" class="max-w-md mx-auto space-y-4">
      <div class="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 class="font-bold">{{ activeSession.name }}</h2>
          <p class="text-xs text-slate-500">{{ activeSession.ascents.length }} Boulders logged</p>
        </div>
        <button @click="endSession" class="text-red-400 font-bold px-3 py-1 bg-red-400/10 rounded-lg">Finish</button>
      </div>
      <AscentLogger @save="addAscent" />
    </div>

    <div v-if="view === 'fingerboard'" class="max-w-md mx-auto space-y-4">
      <div class="flex items-center gap-4 mb-4">
        <button @click="view = 'home'" class="p-2 bg-slate-800 rounded-full">⬅️</button>
        <h2 class="text-xl font-bold">Quick Log Hang</h2>
      </div>
      <FingerboardLogger @save="saveFingerboardOnly" />
    </div>

  </div>
</template>
