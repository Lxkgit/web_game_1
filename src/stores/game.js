import { reactive } from 'vue'

export const gameState = reactive({
  day: 1,
  season: 'spring',
  minutes: 8 * 60,
  gold: 500,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  experience: 0,
  totalFish: 0,
  totalHarvest: 0,
  inventory: {
    seed_potato: 3,
    potato: 0,
    fish_roach: 0,
    fish_carp: 0,
    fish_trout: 0,
    golden_fish: 0,
    stone: 0,
    shell: 0,
    tea: 0
  },
  discovered: ['seed_potato'],
  achievements: [],
  relationships: {
    mira: 0,
    kai: 0,
    luna: 0,
    old_bob: 0
  },
  farm: [
    { id: 1, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 2, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 3, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 4, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 5, crop: null, plantedDay: 0, readyDay: 0 },
    { id: 6, crop: null, plantedDay: 0, readyDay: 0 }
  ],
  log: []
})

export function addLog(text) {
  gameState.log.unshift({ day: gameState.day, text })
  gameState.log = gameState.log.slice(0, 20)
}

export function discover(id) {
  if (!gameState.discovered.includes(id)) gameState.discovered.push(id)
}

export function addItem(id, count = 1) {
  gameState.inventory[id] = (gameState.inventory[id] || 0) + count
  discover(id)
}

export function gainExperience(value) {
  gameState.experience += value
  while (gameState.experience >= gameState.level * 100) {
    gameState.experience -= gameState.level * 100
    gameState.level++
    gameState.maxEnergy += 5
    gameState.energy = gameState.maxEnergy
    addLog(`你提升到了 Lv.${gameState.level}。`)
  }
}
