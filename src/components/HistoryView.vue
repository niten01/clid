<script setup>
import {ref, onMounted} from 'vue'
import {supabase} from '../supabase'
import {denormalizeField, boulderColorStyles} from '../utils'
import {VueSpinnerClimbingBox} from 'vue3-spinners'
import {useToast} from 'vue-toastification';

const toast = useToast();

const emit = defineEmits(['close'])

const activeTab = ref('sessions')
const sessions = ref([])
const fingerboardLogs = ref([])
const loading = ref(true)
const expandedSessionId = ref(null)
const selectedAscent = ref(null)
const warmupExpanded = ref(false)

const gradeColors = {
  '5': 'bg-gray-300',
  '6A': 'bg-yellow-500',
  '6B': 'bg-green-600',
  '6C': 'bg-blue-600',
  '7A': 'bg-red-600',
  '7A+': 'bg-red-800',
  '7B': 'bg-black',
  '7B+': 'bg-black',
  '7C': 'bg-purple-600',
  '7C+': 'bg-purple-700',
}

const fetchData = async () => {
  loading.value = true

  const {data: sessionsData, error: sessionsError} = await supabase
    .from('sessions')
    .select('*, ascents(*)')
    .order('created_at', {ascending: false})

  if (sessionsError) {
    toast.error(sessionsError.message)
    console.log(sessionsError)
    return
  }

  for (const session of sessionsData) {
    session.ascents.sort((a, b) => {
      return a.id > b.id
    })

    session.warmupMap = {}
    session.numWarmups = 0
    for (const ascent of session.ascents) {
      if (ascent.tags.includes('warmup')) {
        session.warmupMap[ascent.grade] = (session.warmupMap[ascent.grade] || 0) + 1;
        session.numWarmups++;
      }

      denormalizeField(ascent, 'tags')
      denormalizeField(ascent, 'incline')
      denormalizeField(ascent, 'result')
    }
  }

  sessions.value = sessionsData

  const {data: fbData, error: fbError} = await supabase
    .from('fingerboard')
    .select('*')
    .order('created_at', {ascending: false})

  for (const log of fbData) {
    denormalizeField(log, 'grip')
    denormalizeField(log, 'edge')
  }

  if (!fbError && fbData) {
    fingerboardLogs.value = fbData
  }

  loading.value = false
}

onMounted(() => {
  fetchData()
})

const toggleSession = (id) => {
  expandedSessionId.value = expandedSessionId.value === id ? null : id
  warmupExpanded.value = false
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

</script>

<template>
  <div class="max-w-md mx-auto h-screen flex flex-col bg-slate-950 text-slate-100">

    <div class="flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
      <button @click="emit('close')" class="text-2xl p-2 rounded-full active:scale-95">←</button>
      <h2 class="text-xl font-bold flex-1">Training History</h2>
    </div>

    <div class="flex p-4 gap-2 bg-slate-950">
      <button @click="activeTab = 'sessions'" class="flex-1 py-3 rounded-xl font-bold text-sm transition-colors"
        :class="activeTab === 'sessions' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'">
        🧗 Sessions
      </button>
      <button @click="activeTab = 'fingerboard'" class="flex-1 py-3 rounded-xl font-bold text-sm transition-colors"
        :class="activeTab === 'fingerboard' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'">
        🦾 Fingerboard
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-20">

      <div v-if="loading" class="flex justify-center text-slate-500 mt-10">
        <VueSpinnerClimbingBox size="15" color="grey" />
      </div>

      <template v-else-if="activeTab === 'sessions'">

        <div v-if="selectedAscent"
          class="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">

          <div
            class="bg-slate-900 border-t sm:border border-slate-700 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-[slideUp_0.2s_ease-out]">

            <button @click="selectedAscent = null"
              class="absolute top-4 right-4 bg-slate-800 text-slate-400 hover:text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              ✕
            </button>

            <div class="flex items-center gap-4 mb-6 border-b border-slate-800 pb-6 mt-2">
              <div :class="gradeColors[selectedAscent.grade]"
                class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span class="text-3xl font-black text-white text-shadow">{{ selectedAscent.grade }}</span>
              </div>
              <div>
                <h2 class="text-2xl font-black text-slate-100 tracking-tight">{{ selectedAscent.name ||
                  "Unnamed" }}</h2>
                <p class="text-slate-400 font-medium">
                  {{ selectedAscent.result.toUpperCase() }} • {{ selectedAscent.attempts }} {{ selectedAscent.result ===
                    'repetition' ?
                    'Reps' : 'Attempts' }}
                </p>
                <p class="text-slate-700 font-xs">
                  ID: {{ selectedAscent.id }} </p>
              </div>
            </div>

            <div class="space-y-4 mb-6">
              <div v-if="selectedAscent.tags?.length > 0">
                <span
                  class="text-[10px] uppercase text-slate-500 font-bold tracking-widest block mb-2">Characteristics</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in selectedAscent.tags" :key="tag"
                    class="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold uppercase">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div v-if="selectedAscent.incline?.length > 0">
                <span class="text-[10px] uppercase text-slate-500 font-bold tracking-widest block mb-2">Wall
                  Angle</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="inc in selectedAscent.incline" :key="inc"
                    class="px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-lg text-xs font-bold uppercase">
                    {{ inc }}
                  </span>
                </div>
              </div>

              <div v-if="selectedAscent.color">
                <span class="text-[10px] uppercase text-slate-500 font-bold tracking-widest block mb-2">Color</span>
                <div class="border-4 rounded-full aspect-square w-[12%]"
                  :class="boulderColorStyles.find(c => c.name === selectedAscent.color)?.class">
                </div>
              </div>
            </div>

            <div class="flex gap-2 mb-6">
              <div class="flex-1 bg-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span class="text-xs uppercase text-slate-400 font-bold">Rating</span>
                <span class="text-yellow-400 font-black text-lg">⭐ {{ selectedAscent.rating || '-' }}/10</span>
              </div>
              <div class="flex-1 bg-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span class="text-xs uppercase text-slate-400 font-bold">Difficulty</span>
                <span class="text-red-400 font-black text-lg">🔥 {{ selectedAscent.difficulty || '-' }}/10</span>
              </div>
            </div>

            <div>
              <span class="text-[10px] uppercase text-slate-500 font-bold tracking-widest block mb-2">Personal
                Notes</span>
              <div
                class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[100px] text-sm text-slate-300 leading-relaxed italic">
                <template v-if="selectedAscent.note">
                  "{{ selectedAscent.note }}"
                </template>
                <template v-else>
                  <span class="text-slate-600 not-italic">No notes recorded for this ascent.</span>
                </template>
              </div>
            </div>

          </div>
        </div>

        <div v-if="sessions.length === 0" class="text-center text-slate-500 mt-10">No sessions logged yet.</div>

        <div v-for="session in sessions" :key="session.id"
          class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
          <button @click="toggleSession(session.id)"
            class="w-full p-4 flex justify-between items-center text-left active:bg-slate-800 transition-colors">
            <div>
              <h3 class="font-bold text-lg text-blue-100">{{ formatDate(session.created_at) }}</h3>
              <p class="text-xs text-slate-400 mt-1">
                {{ session.name }} • {{ session.location || 'Unknown Location' }}
              </p>
            </div>
            <div class="text-right flex flex-col items-end">
              <span class="text-blue-500 font-black text-xl">{{ session.ascents?.length || 0 }}</span>
              <span class="text-[10px] uppercase text-slate-500 font-bold">boulders</span>
            </div>
          </button>

          <div v-if="expandedSessionId === session.id" class="border-t border-slate-800 bg-slate-950/50 p-3 space-y-2">
            <div v-if="!session.ascents || session.ascents.length === 0"
              class="text-xs text-slate-500 text-center py-2">
              No ascents logged in this session.
            </div>

            <div v-if="(session?.numWarmups || 0) > 0">
              <button @click="warmupExpanded = !warmupExpanded"
                class="w-full bg-slate-800 p-3 flex items-center justify-between transition-transform border border-transparent active:border-slate-600 text-left"
                :class="warmupExpanded ? 'rounded-t-xl' : 'rounded-xl'">
                <span class="text-blue-500 font-black text-xl">{{ session?.numWarmups || 0 }}</span>
                <span class="text-[10px] uppercase text-slate-500 font-bold">warmup boulders</span>

              </button>
              <div v-if="warmupExpanded"
                class="border border-slate-800 bg-slate-900/50 flex flex-row gap-2 rounded-b-xl p-3">
                <div v-for="(num, grade) in session.warmupMap">
                  <span :class="gradeColors[grade]"
                    class="px-2 py-0.5 text-white text-shadow rounded font-black text-sm">{{
                      grade }}
                  </span>
                  <span class="text-sm"> ✕ {{ num }}</span>
                </div>
              </div>
            </div>

            <button
              v-for="ascent in session.ascents.filter(a => !a.tags.includes('Warmup')).sort((a, b) => a.id > b.id)"
              :key="ascent.id" @click="selectedAscent = ascent"
              class="w-full bg-slate-800 p-3 rounded-xl flex items-center justify-between active:scale-[0.98] transition-transform border border-transparent active:border-slate-600 text-left">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span :class="gradeColors[ascent.grade]"
                    class="px-2 py-0.5 text-white text-shadow rounded font-black text-sm">{{
                      ascent.grade }}</span>
                  <span v-if="ascent.name" class="font-bold text-sm text-slate-200">{{ ascent.name }}
                  </span>
                  <span v-if="ascent.name" class="font-bold text-sm text-slate-200">•
                  </span>
                  <span class="font-bold text-sm text-slate-200">{{ ascent.result.toUpperCase() }}</span>
                  <span v-if="ascent.attempts > 1" class="text-xs text-slate-400">({{ ascent.attempts }} tries)</span>
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tag in ascent.tags" :key="tag"
                    class="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-bold">
                    {{ tag }}
                  </span>
                  <span v-for="inc in ascent.incline" :key="inc"
                    class="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 uppercase font-bold">
                    {{ inc }}
                  </span>
                  <div v-if="ascent.color" class="border rounded-full aspect-square h-4"
                    :class="boulderColorStyles.find(c => c.name === ascent.color)?.class">
                  </div>
                </div>
              </div>
              <div class="text-right text-xs text-slate-500 space-y-1">
                <div v-if="ascent.rating">⭐ {{ ascent.rating }}/10</div>
                <div v-if="ascent.difficulty">🔥 {{ ascent.difficulty }}/10</div>
              </div>
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'fingerboard'">
        <div v-if="fingerboardLogs.length === 0" class="text-center text-slate-500 mt-10">No fingerboard trainings
          logged.</div>

        <div v-for="log in fingerboardLogs" :key="log.id"
          class="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-indigo-300 text-lg">{{ log.grip }}</span>
              <span class="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">{{ log.edge }}</span>
            </div>
            <p class="text-xs text-slate-400">{{ formatDate(log.created_at) }}</p>
            <div class="mt-2 flex gap-3 text-sm font-semibold text-slate-200">
              <span class="bg-slate-800 px-2 py-1 rounded">{{ log.sets }} <span
                  class="text-slate-500 text-xs">sets</span></span>
              <span class="bg-slate-800 px-2 py-1 rounded">{{ log.reps }} <span
                  class="text-slate-500 text-xs">reps</span></span>
              <span class="bg-slate-800 px-2 py-1 rounded">{{ log.hang_time }}/{{ log.rest_time }}s <span
                  class="text-slate-500 text-xs">hang</span></span>
            </div>
          </div>

          <div class="text-center bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-xl min-w-[60px]">
            <div class="font-black text-xl text-indigo-400">
              {{ log.weight > 0 ? '+' : '' }}{{ log.weight }}
            </div>
            <div class="text-[10px] uppercase font-bold text-indigo-500/70">KG</div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
<style scoped>
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.text-shadow {
  text-shadow: 1px 1px 4px black;
}
</style>
