<script setup>
import AscentLogger from './components/AscentLogger.vue'
import FingerboardLogger from './components/FingerboardLogger.vue'
import HistoryView from './components/HistoryView.vue'
import {supabase} from './supabase'
import {useToast} from "vue-toastification";
import {StorageSerializers, useStorage} from '@vueuse/core'
import {ref} from 'vue';

const view = useStorage('view', 'home') // 'home', 'session', 'fingerboard'
const activeSession = useStorage('activeSession', null, undefined, {serializer: StorageSerializers.object})
const discardClicked = ref(false)

const toast = useToast();

const startSession = () => {
  if (activeSession.value === null) {
    activeSession.value = {
      startTime: new Date(),
      name: `Session ${new Date().toLocaleDateString('ru-RU')}`,
      location: 'RockZona',
      ascents: []
    }
  }
  view.value = 'session'
}

const saveFingerboardOnly = async (hang) => {
  view.value = 'home'

  const {_, error} = await supabase
    .from('fingerboard')
    .insert(hang)

  if (error) {
    toast.error(error.message)
    console.log(error)
    return
  }

  toast.success("Hang saved!")
}

const addAscent = (ascent) => {
  activeSession.value.ascents.push(ascent)
  toast.info("Ascent logged!")
}

const endSession = async () => {
  view.value = 'home'

  if (activeSession.value.ascents.length === 0) {
    toast.warning("Skipping empty session")
    return
  }

  const {data: session, error} = await supabase
    .from('sessions')
    .insert({
      name: activeSession.value.name,
      location: activeSession.value.location,
      // ascents: activeSession.value.ascents
    })
    .select()

  if (error) {
    toast.error(error.message)
    console.log(error)
    return
  }

  for (const ascent of activeSession.value.ascents) {
    ascent.session_id = session.id
  }

  const {_, error: ascentsError} = await supabase
    .from('ascents')
    .insert(activeSession.value.ascents)

  if (ascentsError) {
    toast.error(ascentsError.message)
    console.log(ascentsError)
    return
  }

  activeSession.value = null
  toast.success("Session saved!")
}

const discardSession = () => {
  toast.warning("Session discarded!")
  activeSession.value = null
  view.value = 'home'
}

const discardSafety = () => {
  discardClicked.value = true
  setTimeout(() => {
    discardClicked.value = false
  }, 2000)
}

</script>

<template>
  <div class="min-h-screen bg-gray-950 text-slate-100 p-4 font-sans">

    <div v-if="view === 'home'" class="max-w-md mx-auto h-[80vh] flex flex-col justify-center items-center gap-6">
      <h1
        class="text-4xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        CLID
      </h1>

      <button @click="startSession"
        class="group relative w-full overflow-hidden bg-blue-600 p-8 rounded-3xl transition-all active:scale-95 shadow-xl">
        <div class="relative z-10 flex flex-col items-start">
          <span class="text-3xl">🧗</span>
          <span class="text-2xl font-bold mt-2">Start Session</span>
          <p class="text-blue-200 text-sm">Log multiple ascents & volume</p>
        </div>
        <div class="absolute top-0 right-0 p-4 opacity-20 text-6xl rotate-12">SESSION</div>
      </button>

      <button @click="view = 'fingerboard'"
        class="group relative w-full  overflow-hidden bg-slate-800 p-8 rounded-3xl transition-all active:scale-95 shadow-lg border border-slate-700">
        <div class="relative z-10 flex flex-col items-start">
          <span class="text-3xl">🦾</span>
          <span class="text-2xl font-bold mt-2">Fingerboard</span>
          <p class="text-slate-400 text-sm">Quick log hang set</p>
        </div>
      </button>

      <button @click="view = 'history'"
        class="group relative w-full mt-4 overflow-hidden bg-slate-800/50 p-3 rounded-3xl transition-all active:scale-95 shadow-lg w-[50%]">
        <div class="relative z-10 flex flex-col items-center">
          <span class="text-l font-bold">History</span>
        </div>
      </button>
    </div>

    <div v-if="view === 'session'" class="max-w-md mx-auto space-y-4">
      <div class="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <button @click="view = 'home'" class="text-xl p-2 rounded-full">←</button>
        <div>
          <h2 class="font-bold">{{ activeSession.name }}</h2>
          <p class="text-xs text-slate-500">{{ activeSession.ascents.length }} boulders logged</p>
        </div>
        <div class="flex gap-2">
          <button v-if="discardClicked" @click="discardSession"
            class="text-red-400 font-bold px-3 py-1 bg-red-400/10 rounded-lg">Sure?</button>
          <button v-else @click="discardSafety"
            class="text-orange-400 font-bold px-3 py-1 bg-orange-400/10 rounded-lg">Discard</button>

          <button @click="endSession"
            class="text-green-400 font-bold px-3 py-1 bg-green-400/10 rounded-lg">Finish</button>
        </div>
      </div>
      <AscentLogger @save="addAscent" />
    </div>

    <div v-if="view === 'fingerboard'" class="max-w-md mx-auto space-y-4">
      <div class="flex items-center gap-4 mb-4">
        <button @click="view = 'home'" class="text-xl p-2 rounded-full">←</button>
        <h2 class="text-xl font-bold">Quick Log Hang</h2>
      </div>
      <FingerboardLogger @save="saveFingerboardOnly" />
    </div>

    <div v-if="view === 'history'" class="fixed inset-0 z-50 bg-slate-950">
      <HistoryView @close="view = 'home'" />
    </div>

  </div>
</template>
